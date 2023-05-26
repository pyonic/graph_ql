import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { createProfileBodySchema, changeProfileBodySchema } from './schema';
import type { ProfileEntity } from '../../utils/DB/entities/DBProfiles';
import { UserEntity } from '../../utils/DB/entities/DBUsers';
import { MemberTypeEntity } from '../../utils/DB/entities/DBMemberTypes';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify: any
): Promise<void> => {
  fastify.get('/', async function (request: any, reply: any): Promise<
    ProfileEntity[]
  > {
    return fastify.db.profiles.findMany();
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request: any, reply: any): Promise<ProfileEntity> {
      const profile: ProfileEntity = await fastify.db.profiles.findOne({ key: 'id', equals: request.params.id });

      if (!profile) {
        throw fastify.httpErrors.notFound('Profile not found!');
      }

      return profile;
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createProfileBodySchema,
      },
    },
    async function (request: any, reply: any): Promise<ProfileEntity> {
      const user: UserEntity = await fastify.db.users.findOne({ key: 'id', equals: request.body.userId })
      const memberType: MemberTypeEntity = await fastify.db.memberTypes.findOne({ key: 'id', equals: request.body.memberTypeId })
      const profileExist = await fastify.db.profiles.findOne({ key: 'userId', equals: request.body.userId }) 

      if (!user || !memberType || profileExist) {
        throw fastify.httpErrors.badRequest('Datas are incorrect!')
      }

      const profile: ProfileEntity = await fastify.db.profiles.create(request.body);
      return profile;
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request: any, reply: any): Promise<ProfileEntity> {
      const profile: ProfileEntity = await fastify.db.profiles.findOne({ key: 'id', equals: request.params.id });

      if (!profile) {
        throw fastify.httpErrors.badRequest('Profile not found!');
      }

      await fastify.db.profiles.delete(request.params.id);

      return profile;
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeProfileBodySchema,
        params: idParamSchema,
      },
    },
    async function (request: any, reply: any): Promise<ProfileEntity> {
      const profile: ProfileEntity = await fastify.db.profiles.findOne({ key: 'id', equals: request.params.id });

      if (!profile) {
        throw fastify.httpErrors.badRequest('Profile not found!');
      }

      const profileUpdated: ProfileEntity = await fastify.db.profiles.change(request.params.id, request.body);

      return profileUpdated;
    }
  );
};

export default plugin;
