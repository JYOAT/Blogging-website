import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign, verify } from 'hono/jwt'


const app = new Hono<{
  Bindings:{
    DATABASE_URL: string;
    JWT_SECRET : string;
  },
  Variables : {
    userId : string | any ;
  }
  
}>()

app.use('/api/v1/blog/*', async (c, next) => {
	const authheader = c.req.header('Authorization')|| "";
  const user = await verify(authheader, c.env.JWT_SECRET);
	if (user) {
		c.set('userId',user.id);
		await next();
	}
	else{
    c.status(403);
    return c.json({
      message: "You r not logged in"
    })
  }
})

app.post('/api/v1/user/signup', async (c)=>{
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
}).$extends(withAccelerate());
const body = await c.req.json();
try {
const user = await prisma.user.create({
  data:{
    email : body.email,
    password : body.password,
    name : body.name
  }
})
const token = await sign({id: user.id},c.env.JWT_SECRET)
  return c.json({
  jwt: token
})
}catch(e){
  c.status(411);
  return c.text('Invalid :(');

}

  
  
})


app.post('/api/v1/user/signin', async (c) => {
	const prisma = new PrismaClient({
		datasourceUrl: c.env.DATABASE_URL	,
	}).$extends(withAccelerate());

	const body = await c.req.json();
	try{
  const user = await prisma.user.findFirst({
		where: {
			email : body.email,
      password : body.password
		}
	});

	if (!user) {
		c.status(403);
		return c.json({ message : "incorrect credentials " });
	}

	const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
	return c.json({ jwt });
}catch(e){
  c.status(411);
  return c.text("Invalid")

}

})


app.post('/api/v1/blog', async (c)=>{
  const authorId = c.get('userId');
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
}).$extends(withAccelerate());
  const body = await c.req.json();
  
  const post = await prisma.post.create({
    data:{
      title : body.title,
      content : body.content,
      authorId : parseInt(authorId)
    }
    
  });
  return c.json({
    id : post.id
  });
})

app.put('/api/v1/blog', async(c)=>{
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
}).$extends(withAccelerate());
  const body = await c.req.json();
  const post = await prisma.post.update({
    where :{
      id : body.id
    },
    data:{
      title : body.title,
      content : body.content
    }
    
  })
  return c.json({
    id : post.id
  })
})

app.get('/api/v1/blog/bulk', async (c)=>{
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
}).$extends(withAccelerate());
  const post = await prisma.post.findMany();
  return c.json({
     posts : post
  })

})  


app.get('/api/v1/blog/:id', async (c)=>{
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
}).$extends(withAccelerate());
  const id =  c.req.param("id");
  try {
    const post = await prisma.post.findFirst({
    where :{
      id : Number(id)
    }
  
  })

  return c.json({
    post
  })
  }
  catch(e){
    c.status(411);
    return c.json({
      msg : "error while fetching"

    });
  }
})






export default app
