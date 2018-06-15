'use strict'

const User = use('App/Models/User')
const Post = use('App/Models/Post')
const slugify = require('slugify')

const resolvers = {
  Query: {
    async allUsers() {
      const users = await User.all()
      return users.toJSON()
    },

    async fetchUser(_, { id }) {
      const user = await User.find(id)
      return user.toJSON()
    },

    async allPosts() {
      const posts = await Post.all()
      return posts.toJSON()
    },

    async fetchPost(_, { id }) {
      const post = await Post.find(id)
      return post.toJSON()
    }
  },

  Mutation: {
    async login(_, { email, password }, { auth }) {
      const { token } = await auth.attempt(email, password)
      return token
    },

    async createUser(_, { username, email, password }) {
      return await User.create({ username, email, password })
    },

    async addPost(_, { title, content }, { auth }) {
      try {
        await auth.check()
        const user = await auth.getUser()
        return await Post.create({
          user_id: user.id,
          title,
          slug: slugify(title, { lower: true }),
          content
        })
      } catch (e) {
        throw new Error('Missing or invalid jwt token')
      }
    }
  },

  User: {
    async posts(userInJson) {
      const user = new User()
      user.newUp(userInJson)

      const posts = await user.posts().fetch()
      return posts.toJSON()
    }
  },
  Post: {
    async user(postInJson) {
      const post = new Post()
      post.newUp(postInJson)

      const user = await post.user().fetch()
      return user.toJSON()
    }
  }
}

module.exports = resolvers
