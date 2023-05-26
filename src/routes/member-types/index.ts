import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { changeMemberTypeBodySchema } from './schema';
import type { MemberTypeEntity } from '../../utils/DB/entities/DBMemberTypes';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify: any
): Promise<void> => {
  fastify.get('/', async function (request: any, reply: any): Promise<
    MemberTypeEntity[]
  > {
    const types: Promise<MemberTypeEntity[]> = fastify.db.memberTypes.findMany();
    return types
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request: any, reply: any): Promise<MemberTypeEntity> {
      const types: Promise<MemberTypeEntity> = await fastify.db.memberTypes.findOne({key: 'id', equals: request.params.id});
      if (!types) {
        throw fastify.httpErrors.notFound('Type not found!')
      }
      return types
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeMemberTypeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request: any, reply: any): Promise<MemberTypeEntity> {
      const types: Promise<MemberTypeEntity> = await fastify.db.memberTypes.findOne({key: 'id', equals: request.params.id});
      
      if (Object.keys(request.body).length < 1) {
        throw fastify.httpErrors.badRequest('No data provided for update')
      }
      if (!types) {
        throw fastify.httpErrors.badRequest('Type not found!')
      }
      const updated: Promise<MemberTypeEntity> = await fastify.db.memberTypes.change(request.params.id, request.body)
      return updated
    }
  );
};

export default plugin;
