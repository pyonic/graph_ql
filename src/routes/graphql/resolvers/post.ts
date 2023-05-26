import { GraphQLID, GraphQLInputObjectType, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from "graphql";
import { Post } from "../EntityTypes";
import { UserEntity } from "../../../utils/DB/entities/DBUsers";
import { PostEntity } from "../../../utils/DB/entities/DBPosts";


const PostInputData = new GraphQLInputObjectType({
    name: 'PostInputData',
    fields: {
        title: { type: GraphQLString },
        content: { type: GraphQLString },
        userId: { type: GraphQLString }
    }
});

const PostUpdateInput = new GraphQLInputObjectType({
    name: 'PostUpdateInput',
    fields: {
        title: { type: GraphQLString },
        content: { type: GraphQLString }
    }
})

const PostType = new GraphQLObjectType({
    name: 'post',
    fields: () => ({
        id: { type: GraphQLID },
        title: { type: GraphQLString },
        content: { type: GraphQLString },
        userId: { type: GraphQLID },
    }),
});

const createPostMutation = {
    type: Post,
    args: {
        data: { type: PostInputData }
    },
    resolve: async (parent: any, args: any, context: any, info: any) => {
        const newPost = {
            title: args.data.title,
            content: args.data.content,
            userId: args.data.userId,
        }
        const user: UserEntity = await context.fastify.db.users.findOne({ key: 'id', equals: newPost.userId });

        if (!user) {
            throw new Error('User not found!');
        }

        const post: PostEntity = await context.fastify.db.posts.create(newPost);
        return post
    }
}

const updatePost = {
    type: Post,
    args: {
        id: { type: new GraphQLNonNull(GraphQLID)},
        data: { type: PostUpdateInput }
    },
    resolve: async (parent: any, args: any, context: any, info: any) => {
        const post: PostEntity = await context.fastify.db.posts.findOne({ key: 'id', equals: args.id }) 
        
        delete args.data?.id;

        const toUpdate = args.data;

        if (!post) throw context.fastify.httpErrors.badRequest("Post not found!");
        if (toUpdate.userId) {
            const user: UserEntity = context.fastify.db.users.findOne({key: 'id', equals: toUpdate.userId })
            if (!user) throw context.fastify.httpErrors.badRequest("User not found!");
        }

        const newPost: PostEntity = { ...post, ...toUpdate };
        
        await context.fastify.db.posts.change(args.id, newPost);
        
        return newPost;
    }
}

const getPostsQuery = {
    type: new GraphQLList(Post),
    resolve: async (parent: any, args: any, context: any, info: any) => {
        return await context.fastify.db.posts.findMany();
    },
}

const getPostQuery = {
    type: Post,
    args: {
        id: { type: GraphQLID }
    },
    resolve: async (parent: any, args: any, context: any, info: any) => {
        return context.fastify.db.posts.findOne({ key: 'id', equals: args.id }) || {};
    },
}

export { createPostMutation, PostType, getPostsQuery, getPostQuery, updatePost }