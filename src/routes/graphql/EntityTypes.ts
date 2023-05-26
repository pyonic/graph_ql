import { GraphQLObjectType, GraphQLInt } from "graphql";
import { GraphQLList } from "graphql/type/definition";
import { GraphQLID, GraphQLString } from "graphql/type/scalars";

const User = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: { type: GraphQLID },
        firstName: { type: GraphQLString },
        lastName: { type: GraphQLString },
        email: { type: GraphQLString },
        subscribedToUserIds: { type: new GraphQLList(GraphQLID) }
    })
});

const UserSubscriptions = new GraphQLObjectType({
    name: 'UserSubscriptions',
    fields: () => ({
        id: { type: GraphQLID },
        firstName: { type: GraphQLString },
        lastName: { type: GraphQLString },
        email: { type: GraphQLString },
        userSubscribedTo: { type: new GraphQLList(GraphQLID) },
        subscribedToUser:  { type: new GraphQLList(GraphQLID) },
        profile: { type: Profile }
    })
});


const Subscription = new GraphQLObjectType({
    name: 'Subscription',
    fields: () => ({
        id: { type: GraphQLID },
        userSubscribedTo: { type: new GraphQLList(User) },
        subscribedToUser:  { type: new GraphQLList(User) },
    })
});


const UserDetailedSubscription = new GraphQLObjectType({
    name: 'UserDetailedSubscription',
    fields: () => ({
        id: { type: GraphQLID },
        userSubscribedTo: { type: new GraphQLList(Subscription) },
        subscribedToUser:  { type: new GraphQLList(Subscription) },
    })
});

const Profile = new GraphQLObjectType({
    name: 'Profile',
    fields: () => ({
        id: { type: GraphQLID },
        avatar: { type: GraphQLString },
        sex: { type: GraphQLString },
        birthday: { type: GraphQLInt },
        country: { type: GraphQLString },
        street: { type: GraphQLString },
        city: { type: GraphQLString },
        memberTypeId: { type: GraphQLString },
        userId: { type: GraphQLString },
    })
});

const Post = new GraphQLObjectType({
    name: 'Post',
    fields: () => ({
        id: { type: GraphQLID },
        title: { type: GraphQLString },
        content: { type: GraphQLString },
        userId: { type: GraphQLString }
    })
});

const MemberType = new GraphQLObjectType({
    name: 'MemberType',
    fields: () => ({
        id: { type: GraphQLID },
        discount: { type: GraphQLInt },
        monthPostsLimit: { type: GraphQLInt },
    })
});

export { 
    User,
    Profile,
    Post,
    MemberType,
    UserSubscriptions,
    UserDetailedSubscription
}