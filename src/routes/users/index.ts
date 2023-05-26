import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import {
  createUserBodySchema,
  changeUserBodySchema,
  subscribeBodySchema,
} from './schemas';
import type { UserEntity } from '../../utils/DB/entities/DBUsers';
import { PostEntity } from '../../utils/DB/entities/DBPosts';
import { ProfileEntity } from '../../utils/DB/entities/DBProfiles';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify: any
): Promise<void> => {
  fastify.get('/', async function (request: any, reply: { send: (arg0: Promise<UserEntity>) => UserEntity[] | PromiseLike<UserEntity[]>; }): Promise<UserEntity[]> {
    const usersList: UserEntity[] = fastify.db.users.findMany()
    return usersList
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request: { params: { id: string; }; }, reply: { status: (arg0: number) => void; send: (arg0: Promise<UserEntity>) => UserEntity | PromiseLike<UserEntity>; }): Promise<UserEntity> {
      const user: UserEntity = await fastify.db.users.findOne({ key: 'id', equals: request.params.id })
      if (!user) {
        throw fastify.httpErrors.notFound('User not found');
      } else {
        return user
      }
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createUserBodySchema,
      },
    },
    async function (request: { body: UserEntity; }, reply: any): Promise<UserEntity> {
      const user: any = request.body;
      return fastify.db.users.create(user);
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request: { params: { id: any; }; }, reply: any): Promise<UserEntity> {
      const id: any = request.params.id;
      const user: UserEntity = await fastify.db.users.findOne({ key: 'id', equals: id }); 
      
      if (!user) {
        throw fastify.httpErrors.badRequest('User not found');
      }

      const userPosts = await fastify.db.posts.findMany({ key: 'userId', equals: id })
      const profile: ProfileEntity = await fastify.db.profiles.findOne({ key: 'userId', equals: id })
      const users = await fastify.db.users.findMany();

      users.forEach(async (user: UserEntity) => {
        if (user.subscribedToUserIds.includes(id)) {
          user.subscribedToUserIds = user.subscribedToUserIds.filter(u => u !== id).map(u => u);
          await fastify.db.users.change(user.id, user)
        }
      })

      if (profile) await fastify.db.profiles.delete(profile.id)
      if (userPosts) {
        userPosts.forEach(async (post: PostEntity) => {
          await fastify.db.posts.delete(post.id)
        })
      }

      await fastify.db.users.delete(id)
      return Promise.resolve(user);
    }
  );

  fastify.post(
    '/:id/subscribeTo',
    {
      schema: {
        body: subscribeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request: any, reply: any): Promise<UserEntity> {
      const id: any = request.params.id;
      const userId: any = request.body.userId;
      const user: UserEntity = await fastify.db.users.findOne({ key: 'id', equals: id });
      const subscribing: UserEntity = await fastify.db.users.findOne({ key: 'id', equals: userId });

      if (!user || !subscribing) {
        throw fastify.httpErrors.badRequest('Datas are incorrect');
      }

      if (!subscribing.subscribedToUserIds.includes(id)) {
        subscribing.subscribedToUserIds.push(id)
      }
      await fastify.db.users.change(userId, subscribing);

      return Promise.resolve(user);
    }
  );

  fastify.post(
    '/:id/unsubscribeFrom',
    {
      schema: {
        body: subscribeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request: any, reply: any): Promise<UserEntity> {
      const id: any = request.params.id;
      const userId: any = request.body.userId;
      const user: UserEntity = await fastify.db.users.findOne({ key: 'id', equals: id });
      const following: UserEntity = await fastify.db.users.findOne({ key: 'id', equals: userId });

      if (!user || !following.subscribedToUserIds.includes(id)) {
        throw fastify.httpErrors.badRequest('Datas are incorrect');
      }

      following.subscribedToUserIds = following.subscribedToUserIds.filter((ui: any) => ui !== id).map((ui: any) => ui)

      await fastify.db.users.change(userId, following);

      return Promise.resolve(user);
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeUserBodySchema,
        params: idParamSchema,
      },
    },
    async function (request: any, reply: any): Promise<UserEntity> {
      const id: any = request.params.id;
      const upUser: any = request.body;

      const user: UserEntity = await fastify.db.users.findOne({ key: 'id', equals: id });
      
      if (!user) {
        throw fastify.httpErrors.badRequest('Datas are incorrect');
      }
      
      const update: UserEntity = await fastify.db.users.change(id, upUser);

      return Promise.resolve(update);
    }
  );
};

export default plugin;
