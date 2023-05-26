import { GraphQLID, GraphQLInputObjectType, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from "graphql"
import { UserEntity } from "../../../utils/DB/entities/DBUsers"
import { MemberTypeEntity } from "../../../utils/DB/entities/DBMemberTypes"
import { ProfileEntity } from "../../../utils/DB/entities/DBProfiles"

const Profile = new GraphQLObjectType({
    name: 'Profile',
    fields: () => ({
        id: { type: GraphQLID },
        avatar: { type: GraphQLString },
        sex: { type: GraphQLString },
        birthday: { type: GraphQLString },
        country: { type: GraphQLString },
        street: { type: GraphQLString },
        city: { type: GraphQLString },
        memberTypeId: { type: GraphQLString },
        userId: { type: GraphQLString },
    })
});


const ProfileInputObject = new GraphQLInputObjectType({
    name: 'ProfileDto',
    fields: {
        avatar: { type: GraphQLString },
        sex: { type: GraphQLString },
        birthday: { type: GraphQLString },
        country: { type: GraphQLString },
        street: { type: GraphQLString },
        city: { type: GraphQLString },
        memberTypeId: { type: GraphQLString },
        userId: { type: GraphQLID },
    }
})

const createProfileMutation = {
    type: Profile,
    args: {
        data: { type: ProfileInputObject }
    },
    resolve: async (parent: any, args: any, context: any, info: any) => {
        const newProfile = {
            avatar: args.data.avatar,
            sex: args.data.sex,
            birthday: args.data.birthday,
            country: args.data.country,
            street: args.data.street,
            city: args.data.city,
            memberTypeId: args.data.memberTypeId,
            userId: args.data.userId,
        }
        const user: UserEntity = await context.fastify.db.users.findOne({ key: 'id', equals: newProfile.userId })
        const memberType: MemberTypeEntity = await context.fastify.db.memberTypes.findOne({ key: 'id', equals: newProfile.memberTypeId })
        const profileExist = await context.fastify.db.profiles.findOne({ key: 'userId', equals: newProfile.userId }) 

        if (!user) {
            throw context.fastify.httpErrors.badRequest('User not found.')
        } else if (!memberType) {
            throw context.fastify.httpErrors.badRequest('Member type not found.')
        } else if (profileExist) {
            throw context.fastify.httpErrors.badRequest('Profile already exists.')
        }

        const profile: ProfileEntity = await context.fastify.db.profiles.create(newProfile);
        return profile;
    }
}

const updateProfile = {
    type: Profile,
    args: {
        id: { type: new GraphQLNonNull(GraphQLID)},
        data: { type: ProfileInputObject }
    },
    resolve: async (parent: any, args: any, context: any, info: any) => {
        const profile: ProfileEntity = await context.fastify.db.profiles.findOne({ key: 'id', equals: args.id }) 
        
        const toUpdate = args.data;

        if (!profile) throw context.fastify.httpErrors.badRequest("Profile not found!");
        if (toUpdate.memberTypeId) {
            const memberType: MemberTypeEntity = await context.fastify.db.memberTypes.findOne({key: 'id', equals: toUpdate.memberTypeId })
            if (!memberType) throw context.fastify.httpErrors.badRequest("Member type not found!");
        }

        const newProfile: ProfileEntity = { ...profile, ...toUpdate };
        
        await context.fastify.db.profiles.change(args.id, newProfile);
        
        delete args.data?.id;

        return newProfile;
    }
}

const getProfileQuery = {
    type: Profile,
    args: {
        id: { type: GraphQLID }
    },
    resolve: async (parent: any, args: any, context: any, info: any) => {
        return context.fastify.db.profiles.findOne({ key: 'id', equals: args.id }) || {};
    },
}

const getProfilesQuery = {
    type: new GraphQLList(Profile),
    resolve: async (parent: any, args: any, context: any, info: any) => {
        return context.fastify.db.profiles.findMany();
    },
}

export { 
    createProfileMutation,
    ProfileInputObject,
    getProfileQuery,
    getProfilesQuery,
    updateProfile,
    Profile
}