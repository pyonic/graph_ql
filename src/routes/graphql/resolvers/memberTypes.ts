import {
    GraphQLObjectType,
    GraphQLList,
    GraphQLString,
    GraphQLInt,
    GraphQLInputObjectType,
    GraphQLNonNull,
} from 'graphql';
  
const MemberTypeGQL = new GraphQLObjectType({
    name: 'MemberTypeGQL',
    fields: () => ({
        id: { type: GraphQLString },
        discount: { type: GraphQLInt },
        monthPostsLimit: { type: GraphQLInt },
    }),
});

const MemberTypeDTO = new GraphQLInputObjectType({
    name: 'MemberTypeDTO',
    fields: () => ({
        discount: { type: GraphQLInt },
        monthPostsLimit: { type: GraphQLInt },
    }),
});

const getMemberTypesQuery = {
    type: new GraphQLList(MemberTypeGQL),
    resolve: async (parent: any, args: any, context: any, meta: any) => {
        return await context.fastify.db.memberTypes.findMany();
    },
};

const getMemberType = {
    type: MemberTypeGQL,
    args: { id: { type: GraphQLString } },
    resolve: async (parent: any, args: any, context: any, meta: any) => {
        const mType = await context.fastify.db.memberTypes.findOne({ key: 'id', equals: args.id });

        if (!mType) throw context.fastify.httpErrors.notFound();

        return mType;
    },
};

const updateMemberType = {
    type: MemberTypeGQL,
    args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        data: { type: MemberTypeDTO },
    },
    resolve: async (parent: any, args: any, context: any, meta: any) => {
        const { id, data } = args,
        
        memberTypeToUpdate = await context.fastify.db.memberTypes.findOne({
            key: 'id',
            equals: id,
        });

        if (!memberTypeToUpdate) {
            throw context.fastify.httpErrors.notFound();
        }

        return context.fastify.db.memberTypes.change(id, data);
    },
};

export { MemberTypeGQL, getMemberTypesQuery, getMemberType, updateMemberType };