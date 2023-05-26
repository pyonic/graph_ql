import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import * as depthLimit from 'graphql-depth-limit';

import { graphql } from 'graphql/graphql';
import getSchema from './resolvers';
import { graphqlBodySchema } from './schema';
import { parse, validate } from 'graphql';
import { isEmpty } from 'lodash';

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
      const schema = getSchema(this);

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