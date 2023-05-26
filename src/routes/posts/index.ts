import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { createPostBodySchema, changePostBodySchema } from './schema';
import type { PostEntity } from '../../utils/DB/entities/DBPosts';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify: any
): Promise<void> => {
  fastify.get('/', async function (request: any, reply: any): Promise<PostEntity[]> {
    return fastify.db.posts.findMany();
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request: any, reply: any): Promise<PostEntity> {
      const post: PostEntity = await fastify.db.posts.findOne({ key: 'id', equals: request.params.id });
      
      if (!post) {
        throw fastify.httpErrors.notFound('Post not found');
      }

      return post;
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createPostBodySchema,
      },
    },
    async function (request: any, reply: any): Promise<PostEntity> {
      const postBody: any = request.body;
      const post: PostEntity = await fastify.db.posts.create(postBody);

      return post;
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request: any, reply: any): Promise<PostEntity> {
      const post: PostEntity = await fastify.db.posts.findOne({ key: 'id', equals: request.params.id });
      if (!post) {
        throw fastify.httpErrors.badRequest('Post not found');
      }
      await fastify.db.posts.delete(request.params.id);
      return post;
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changePostBodySchema,
        params: idParamSchema,
      },
    },
    async function (request: any, reply: any): Promise<PostEntity> {
      const post: PostEntity = await fastify.db.posts.findOne({ key: 'id', equals: request.params.id });
      if (!post || Object.keys(request.body).length < 1) {
        throw fastify.httpErrors.badRequest('Post not found');
      }
      const updatedPost: PostEntity = await fastify.db.posts.change(request.params.id, request.body);
      return updatedPost;
    }
  );
};

export default plugin;
