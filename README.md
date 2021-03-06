# Services-Cache 

[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

[![Build Status](https://travis-ci.com/LabShare/services-cache.svg?token=zsifsALL6Np5avzzjVp1&branch=master)](https://travis-ci.com/LabShare/services-cache)

Services-cache is a Redis cache plugin for [LabShare Services](https://github.com/LabShare/services).

## Requirements

- [Node.js](https://nodejs.org/) v6+
- Redis (if Redis is not installed locally you can use this [docker file](https://github.com/LabShare/services-cache/blob/master/run/Dockerfile))

## Development
```sh
npm i @labshare/services-cache
```
*You might need to use sudo (UNIX).


# labshare/services-cache 
Simple and extensible caching module with redis and memory storage and supporting decorators.

<!-- TOC depthTo:2 -->

- [services-cache](#labshare/services-cache )
- [Install](#install)
- [Usage](#usage)
    - [With decorator](#with-decorator)
    - [Directly](#directly)
- [Strategies](#strategies)
    - [LabShareCache](#labsharecache)
- [Storages](#storages)
- [Test](#test)

<!-- /TOC -->

# Install
```bash
   npm install --save @labshare/services-cache 
```

## Usage

## Steps to use directly in Simple Express Application

### Step: 1

Create a Config folder in the root and add config file under config/default.json

    ```json
    "services":
    {
    "cache": {
      "type": "redis", // specifies if memory ( default) or redis storage is being selected.
      "redis": {
        "host": "ec2-52-90-18-4.compute-2.amazonaws.com", // eg : redis server 
        "port": 6379
      },
      "memory":{
        "isGlobalCache" : true
      }
    }
    }
    ```

### Step: 2

```ts
import {LabShareCache} from "@labshare/services-cache";
const config = require('config');
...
...
// if redis 
const myRedisCache = new LabShareCache(config.get('services.cache'));
// if memory 
// change type to memory

const memoryCache = new LabShareCache(config.get('services.cache'));

class MyService {
    
/**
   * GET one hero by id
   */
  public async getOne(req: Request, res: Response, next: NextFunction) {
    let query = parseInt(req.params.id);
    const cachekey = "cacheKey:"+query;

    const cachedSearchResults = await myRedisCache.getItem<string>(cachekey);

    if (cachedSearchResults) {
      return cachedSearchResults;
    }

    let hero = Heroes.find(hero => hero.id === query);
    await myRedisCache.setItem(cachekey, hero, { ttl: 120, isCachedForever: false });

    if (hero) {
      res.status(200)
        .send({
          message: 'Successfully',
          status: res.status,
          hero
        });
    }
    else {
      res.status(404)
        .send({
          message: 'No hero found with the given id.',
          status: res.status
        });
    }
  }
}
```
## Steps to use in Simple Loopback Application

### Step 1 : Bind the ServicesCache component to application

```ts
import {ServicesCache} from '@labshare/services-cache';
import {ServicesConfigComponent} from '@labshare/services-config';

// Other imports …
export class LbServicesExampleApplication

{
constructor(options: ApplicationConfig = {}){
  // binding
    this.bind(CacheBindings.CACHE_CONFIG).to({
      "type": "redis",
      "redis": {
        "host": "redis", // eg : redis server ec2-52-90-18-4.compute-1.amazonaws.com
        "port": 6379
      }
    });
this.component(ServicesCache); // Method implementation ...
  }
}
...
  ...

```
### Step 2 : With decorator

## With decorator
Caches function response using the given options. Works with different strategies and storages. Uses all arguments to build an unique key.

`@Cache(options)`
- `options`: Options passed to the cache provider for this particular method

*Note: @Cache always converts the method response to a promise because caching might be async.* 

```ts
import { Cache } from "@labshare/services-cache";

class MyService {
    
    @Cache({ ttl: 60 })
    public async getUsers(): Promise<string[]> {
        return ["John", "Doe"];
    }
}
```

## Directly in the code with loopback application.

```ts
import { LabShareCache } from "@labshare/services-cache";



class MyService {
    constructor(
    @inject(CacheBindings.CACHE)
    private cache: LabShareCache,
  ) {}
    public async getShipToUsers(): Promise<string[]> {
        const cachedUsers = await cache.getItem<string[]>("users");
        if (cachedUsers) {
            return cachedUsers;
        }

        const newUsers = ["John", "Doe"];
        await cache.setItem("users", newUsers, {  ttl: 60 });
        return newUsers;
    }
}
```

# Types
## LabShareCache
Cached items expire after a given amount of time.

 - `ttl`: *(Default: 60)* Number of seconds to expire the cachte item
 - `isLazy`: *(Default: true)* If true, expired cache entries will be deleted on touch. If false, entries will be deleted after the given *ttl*.
 - `noop?`: boolean; // Allows for consuming libraries to conditionally disable caching. Set this to true to disable caching for some reason.
 - `cacheKey?`: string
 - `refreshCache`: boolean.
  
# Storages

| Storage      | Configuration |
|--------------|:---------------------:|
| Redis |  RedisStorage(`{redis}:` [RedisClientOptions](https://github.com/NodeRedis/node_redis#options-object-properties))  |
| memory | MemoryStorage(`{memory}: isGlobalCache =true creates a global instance for local memory, if false is a local storage per instance`) |


# Test
```bash
   npm test
```
## Note

The cache's duration is in seconds, also maxTime is used if no duration is given. 

License
----

MIT