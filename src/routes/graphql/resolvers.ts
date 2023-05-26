import { GraphQLObjectType } from "graphql";
import { GraphQLSchema } from "graphql/type/schema";
import { createUserMutation, getUserQuery, getUsers, subscribeQuery, unsubscribeQuery, updateUserMutation } from "./resolvers/user";
import { createPostMutation, getPostQuery, getPostsQuery, updatePost } from "./resolvers/post";
import { createProfileMutation, getProfileQuery, getProfilesQuery, updateProfile } from "./resolvers/profile";
import { getMemberType, getMemberTypesQuery, updateMemberType } from "./resolvers/memberTypes";

const getSchema = (context: any) => {
    const schema = new GraphQLSchema({
            mutation: new GraphQLObjectType({
                name: 'Mutations',
                fields: () => ({
                    createUser: createUserMutation,
                    updateUser: updateUserMutation,
                    createPost: createPostMutation,
                    updatePost: updatePost,
                    createProfile: createProfileMutation,
                    updateProfile: updateProfile,
                    updateMemberType: updateMemberType,
                    subscribe: subscribeQuery,
                    unsubscribe: unsubscribeQuery
                })
            }),
            query: new GraphQLObjectType({
                name: 'Query',
                fields: {
                    user: getUserQuery,
                    users: getUsers,
                    memberTypes: getMemberTypesQuery,
                    profile: getProfileQuery,
                    profiles: getProfilesQuery,
                    post: getPostQuery,
                    posts: getPostsQuery,
                    memberType: getMemberType,
            },
        }),
    });
    return schema
}

export default getSchema