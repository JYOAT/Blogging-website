import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign, verify } from 'hono/jwt'
import { createBlogInput, signinInput, signupInput, updateBlogInput } from '@jyotsna20032002/medium-common'
import { cors } from 'hono/cors'




const app = new Hono<{
  Bindings:{
    DATABASE_URL: string;
    JWT_SECRET : string;
  },
  Variables : {
    userId : string | any;
  }
  
}>()
//app.use('/*', cors()) 
app.use('*', cors({
  origin: ['http://localhost:5173', 'https://blog-ten-zeta-22.vercel.app'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

const allowedOrigins = ['https://blog-ten-zeta-22.vercel.app', 'http://localhost:5173'];

app.options('*', (c) => {
  c.res.headers.set('Access-Control-Allow-Origin', c.req.header('Origin')||"");
  c.res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  c.res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  c.res.headers.set('Access-Control-Allow-Credentials', 'true');
  return c.text('', 204); // No content for OPTIONS
});

app.use('*', (c, next) => {
  const origin = c.req.header('Origin')||"";
  if (allowedOrigins.includes(origin)) {
    c.res.headers.set('Access-Control-Allow-Origin', origin);
    c.res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    c.res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    c.res.headers.set('Access-Control-Allow-Credentials', 'true');
  }
  return next();
});
app.use('/api/v1/blog/*', async (c, next) => {
	const authheader = c.req.header('Authorization')|| "";
  try{
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
}catch(e){
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
const {success} = signupInput.safeParse(body);
if (!success){
  c.status(411);
  return c.json({
    message :"inputs not correct"
  });
}
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

	
  const { success} = signinInput.safeParse(body);
  if (!success){
      c.status(411);
      return c.json({
         message :"inputs not correct"
  });
}
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

})


app.post('/api/v1/blog', async (c)=>{
  const authorId = c.get('userId');
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
}).$extends(withAccelerate());
  const body = await c.req.json();
  const {success} = createBlogInput.safeParse(body);
if (!success){
  c.status(411);
  return c.json({
    message :"inputs not correct"
  });
} 
  
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
  const {success} = updateBlogInput.safeParse(body);
if (!success){
  c.status(411);
  return c.json({
    message :"inputs not correct"
  });
}
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
  const post = await prisma.post.findMany({
    select:{
      content:true,
      title: true,
      id : true,
      author :{
        select:{
          name:true
        }
      }
    }
  });
  return c.json({
      blogs : post
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
    },
    select:{
      id:true,
      title : true,
      content:true,
      author: {
        select:{
          name: true
        }
      }
    }
  
  })

  return c.json({
    blog: post
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
