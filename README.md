## Small Fastify Server

### Endpoints

#### "/v1/items/" [GET]
 - retrieves items from SkinPort/items
<p>Parameters:</p>
<b>limit (Optional) number</b> - limits the displayed elements to the number

<p> Redis is used to cache the request </p>

#### "/v1/balance/deduct/:id" [PUT]</b> 
- updates balance of a user by id</p>
<p>BODY:</p>
<b>Amount<b> - number to deduct

### Stack
Node: Fastify
<br>DB: Postgres
<br>Cache: Redis

### Start the server

<p> $ npm install </p>
<p> $ npm run dev </p>


