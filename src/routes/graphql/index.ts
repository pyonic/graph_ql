import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import * as depthLimit from 'graphql-depth-limit';

import { graphql } from 'graphql/graphql';
import { graphqlBodySchema } from './schema';
import { GraphQLObjectType, GraphQLSchema, parse, validate } from 'graphql';
import { isEmpty } from 'lodash';
import { createUserMutation, getUserQuery, getUsers, subscribeQuery, unsubscribeQuery, updateUserMutation } from './resolvers/user';
import { createPostMutation, getPostQuery, getPostsQuery, updatePost } from './resolvers/post';
import { createProfileMutation, getProfileQuery, getProfilesQuery, updateProfile } from './resolvers/profile';
import { getMemberType, getMemberTypesQuery, updateMemberType } from './resolvers/memberTypes';

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

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.post(
    '/',
    {
      schema: {
        body: graphqlBodySchema,
      },
    },
    async function (request, reply) {
      const { query, variables } = request.body;

      if (!isEmpty(validate(schema, parse(query || ''), [ depthLimit(5) ]))) {
        return reply.send({
          data: null,
          errors: `Depth more than max level of 5`,
        });
      }
      
      const result = await graphql({ 
        schema ,
        source: String(query),
        variableValues: variables,
        contextValue: {
          fastify,
          dataloader: new WeakMap()
        }
      })
      reply.send(result);
    }
  );
};

export default plugin;