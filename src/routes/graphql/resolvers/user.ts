import { GraphQLID, GraphQLInputObjectType, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLResolveInfo, GraphQLString } from "graphql";
import { MemberType, Profile, User } from "../EntityTypes";
import { UserEntity } from "../../../utils/DB/entities/DBUsers";
import { PostType } from "./post";
import { PostEntity } from "../../../utils/DB/entities/DBPosts";
import { MemberTypeEntity } from "../../../utils/DB/entities/DBMemberTypes";
import { ProfileEntity } from "../../../utils/DB/entities/DBProfiles";
import { generateDataLoader } from "../DataLoader";
import DataLoader = require("dataloader");

const UserInputType = new GraphQLInputObjectType({
    name: 'UserInput',
    fields: {
        firstName: { type: GraphQLString },
        lastName: { type: GraphQLString },
        email: { type: GraphQLString },
    },
});

const UserDetails: any = new GraphQLObjectType({
    name: 'UserDetails',
    fields: () => ({
        id: { type: GraphQLID },
        firstName: { type: GraphQLString },
        lastName: { type: GraphQLString },
        email: { type: GraphQLString },
        subscribedToUserIds: { type: new GraphQLList(GraphQLID) },
        posts: { 
            type: new GraphQLList(PostType),
            resolve: async (user: UserEntity, args: any, context: any, info: GraphQLResolveInfo) => {
                const { dataloader } = context;

                let dl = dataloader.get(info.fieldNodes);
                
                if (!dl) {
                    dl = generateDataLoader({ table: 'posts', filterKey: 'userId'}, context);
                    dataloader.set(info.fieldNodes, dl);
                }

                const posts: PostEntity = dl.load(user.id)

                return posts 
            }
        },
        memberType: { 
            type: MemberType,
            resolve: async (user: UserEntity, args: any, context: any, info: any) => {
                const { dataloader, fastify } = context;
                let dl = dataloader.get(info.fieldNodes);

                if (!dl) {
                    dl = new DataLoader(async (userIds: any) => {
                        const profiles = await fastify.db.profiles.findMany({ key: 'userId', equalsAnyOf: userIds });
                        const memberTypes = await fastify.db.memberTypes.findMany();
                        const sortedData = userIds.map((id: any) => {
                            return memberTypes.find((mt: MemberTypeEntity) => {
                                return mt.id === (profiles.find((p: ProfileEntity) => p.userId == id))?.memberTypeId
                            } )
                        });
                        console.log("sortedData__: ", sortedData);
                        
                        return sortedData;
                    });
                    dataloader.set(info.fieldNodes, dl);
                }

                const memberType: MemberTypeEntity = dl.load(user.id);
                return memberType;

                // const profile: ProfileEntity = context.fastify.db.profiles.findOne({ key: 'userId', equals: user.id });
                // if (!profile) return {}
                // const memberTypeId: string = profile.memberTypeId;
                // const memberType: MemberTypeEntity = fastify.db.memberTypes.findOne({ key: 'id', equals: memberTypeId });
                // return memberType;
            }
        },
        profile: {
            type: Profile,
            resolve: async (user: UserEntity, args: any, context: any, meta: any) => {
                const profile: ProfileEntity = context.fastify.db.profiles.findOne({ key: 'userId', equals: user.id });
                return profile || {};
            }
        },
        userSubscribedTo: {
            type: new GraphQLList(UserDetails),
            resolve: async (parent: UserEntity, args: any, context: any, meta: any) => {
                const users = await context.fastify.db.users.findMany();
                console.log(users, parent.subscribedToUserIds );
                
                return users.filter((user: UserEntity)  => parent.subscribedToUserIds.includes(user.id));
            }
        },
        subscribedToUser: {
            type: new GraphQLList(UserDetails),
            resolve: async (parent: UserEntity, args: any, context: any, meta: any) => {
                const users = await context.fastify.db.users.findMany();
                return users.filter((user: UserEntity)  => user.subscribedToUserIds.includes(parent.id));
            }
        }

    })
});


const createUserMutation = {
    type: User,
    args: {
        data: { type: UserInputType }
    },
    resolve: async (parent: any, args: any, context: any, meta: any) => {
        const newUser = {
            firstName: args.data.firstName,
            lastName: args.data.lastName,
            email: args.data.email,
        }
        const user: UserEntity = await context.fastify.db.users.findOne({ key: 'email', equals: newUser.email });
        
        if (user) throw Error("User with this email already exists.");
        
        return await context.fastify.db.users.create(newUser);;
    }
}

const updateUserMutation = {
        type: User,
        args: {
            id: { type: new GraphQLNonNull(GraphQLID) },
            data: { type: UserInputType }
        },
        resolve: async (parent: any, args: any, context: any, meta: any) => {
            const id: any = args.id;
            const upUser: any = args.data;

            const user: UserEntity = await context.fastify.db.users.findOne({ key: 'id', equals: id });
            
            if (!user) {
                throw context.fastify.httpErrors.badRequest('User not found');
            }
            
            await context.fastify.db.users.change(id, upUser);

            const updatedUser: UserEntity = await context.fastify.db.users.findOne({ key: 'id', equals: id });

            return updatedUser;
        }
}

const getUsers = {
    type: new GraphQLList(UserDetails),
    resolve: async (parent: any, args: any, context: any, meta: any) => {
        return context.fastify.db.users.findMany();
    },
}

const getUserQuery = {
    type: UserDetails,
    args: {
        id: { type: GraphQLID }
    },
    resolve: async (parent: any, args: any, context: any, meta: any) => {
        console.log('HELLL !');
        
        return await context.fastify.db.users.findOne({ key: 'id', equals: args.id });
    },
}

const subscribeQuery = {
    type: UserDetails,
    args: {
        subscriptionId: { type: new GraphQLNonNull(GraphQLID) },
        userId: { type: new GraphQLNonNull(GraphQLID) }
    },
    resolve: async (parent: any, args: any, context: any, info: any) => {
    
        if (args.userId === args.subscriptionId) {
            throw context.fastify.httpErrors.badRequest("You can not subscribe to yourself")
        }

        const user: UserEntity = await context.fastify.db.users.findOne({ key: 'id', equals: args.userId });
        const subscriptionUser: UserEntity = await context.fastify.db.users.findOne({ key: 'id', equals: args.subscriptionId });

        if (!user || !subscriptionUser) {
            throw context.fastify.httpErrors.badRequest("User not found");
        } else if (user.subscribedToUserIds.includes(args.subscriptionId)) {
            return user
        }

        user.subscribedToUserIds.push(args.subscriptionId);
        
        await context.fastify.db.users.change(args.userId, user);

        return user
    }
}

const unsubscribeQuery = {
    type: UserDetails,
    args: {
        subscriptionId: { type: new GraphQLNonNull(GraphQLID) },
        userId: { type: new GraphQLNonNull(GraphQLID) }
    },
    resolve: async (parent: any, args: any, context: any, meta: any) => {
        const user: UserEntity = await context.fastify.db.users.findOne({ key: 'id', equals: args.userId });

        if (!user) {
            throw context.fastify.httpErrors.badRequest("User not found");
        }

        user.subscribedToUserIds = user.subscribedToUserIds.filter(uid => uid != args.subscriptionId)
        
        await context.fastify.db.users.change(args.userId, user);

        return user
    }
}

export { 
    createUserMutation,
    updateUserMutation,
    getUsers,
    UserDetails,
    getUserQuery,
    subscribeQuery,
    unsubscribeQuery
}