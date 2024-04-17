import { createBlogInput, updateBlogInput } from "@shubh555/medium-common";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { verify, decode } from "hono/jwt";

export const blogRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string,
        JWT_SECRET: string,
    },
    Variables: {
        userId: string;
    }
}>();

blogRouter.use("/*", async (c,next) => {
    const authHeader = c.req.header("authorization") || "";
    try{
        const user = await verify(authHeader, c.env.JWT_SECRET);
        if (user){
            c.set("userId", user.id);
            await next();
        }
        else{
            c.status(403)
            return c.json({message: "You are not loggin in"});
        }
    }
    catch(e){
        c.status(403)
        return c.json({message: "You are not loggin in"});
    }
})

blogRouter.post('/', async (c) => {
    const body = await c.req.json();
    const {success} = createBlogInput.safeParse(body);
    if(!success){
        c.status(411);
        return c.json({error: "invalid input"});
    }

    const authorId = c.get('userId');
    const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL	,
	}).$extends(withAccelerate());

    const blog = await prisma.post.create({
        data: {
            title: body.title,
            content:body.content,
            authorId: authorId 
        }
    })

    return c.json({
        id: blog.id
    })
})

blogRouter.put('/', async (c) => {
    const body = await c.req.json();
    const {success} = updateBlogInput.safeParse(body);
    if(!success){
        c.status(411);
        return c.json({error: "invalid input"});
    }

    const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL	,
	}).$extends(withAccelerate());

    const blog = await prisma.post.update({
        where: {
            id: body.id,
        },
        data: {
            title: body.title,
            content:body.content
        }
    })

    return c.json({
        id: blog.id
    })
	
})

// can implement pagination --> adding 10 blogs to user and don't return more untill user asks it
blogRouter.get("/bulk", async (c) => {
    const body = await c.req.json();
    const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL	,
	}).$extends(withAccelerate());

    const blogs = await prisma.post.findMany();
    return c.json({
        blogs
    })

})

blogRouter.get('/:id', async (c) => {
	const id = c.req.param("id");
    const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL	,
	}).$extends(withAccelerate());

    try{
        const blog = await prisma.post.findFirst({
            where: {
                id: id,
            },
        }) 
    
        return c.json({
            blog
        })
    }
    catch(e){
        c.status(411);
        return c.json({
            message: "Error while fetching blog post"
        })
    }
})


