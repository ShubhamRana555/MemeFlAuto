import { Hono } from 'hono';
import { userRouter } from './routes/user';
import { blogRouter } from './routes/blog';
import {sign, verify} from 'hono/jwt'

// Create the main Hono app
const app = new Hono<{
	Bindings: {
		DATABASE_URL: string,
		JWT_SECRET: string,
	}
}>();

app.route("api/v1/user", userRouter);
app.route("api/v1/blog", blogRouter);


// app.use('/api/v1/blog/*', async (c, next) => {
//   // get the header
//   // verify the header
//   // if the header is correct, we can proceed
//   // if not, we return the 403 response code
//   const header = c.req.header("authorization") || "";
//   const response = await verify(header, c.env.JWT_SECRET)
//   if(response.id){
//     next()
//   }
//   else{
//     c.status(403)
//     return c.json({error: "unauthorized"})
//   }
// })



export default app;
