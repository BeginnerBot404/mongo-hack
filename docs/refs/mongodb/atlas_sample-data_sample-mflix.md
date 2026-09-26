> For the complete MongoDB documentation index, see www.mongodb.com/docs/llms.txt

# Sample Mflix Dataset

The `sample_mflix` database contains data on movies and movie theaters. The database also contains collections for certain metadata, including users and comments on specific movies.

To learn how to load the sample data provided by MongoDB Atlas into your cluster, see [Import Sample Data Into Your Atlas Deployment.](https://www.mongodb.com/docs/atlas/import/load-sample-data.md#std-label-load-sample-data)

## Collections

The `sample_mflix` database contains the following collections:

| Collection Name | Description |
| --- | --- |
| [comments](https://www.mongodb.com/docs/manual/sample-data/sample-mflix.md#std-label-mflix-comments) | Contains comments associated with specific movies. |
| [embedded_movies](https://www.mongodb.com/docs/manual/sample-data/sample-mflix.md#std-label-mflix-embedded_movies) | Contains details on movies in the `Western`, `Action`, and `Fantasy` genres from [`sample_mflix.movies`](https://www.mongodb.com/docs/manual/sample-data/sample-mflix.md#std-label-mflix-movies) collection with the following additional fields: `plot_embedding_voyage_3_large` - Contains 2048d embeddings created from the `plot` field using Voyage AI's `voyage-3-large` embedding model and converted to `binData` for efficient storage and retrieval.; `plot_embedding` - Contains 1536d embeddings created from the `plot` field using OpenAI's `text-embedding-ada-002` embedding model and converted to `binData` for efficient storage and retrieval. |
| [movies](https://www.mongodb.com/docs/manual/sample-data/sample-mflix.md#std-label-mflix-movies) | Contains movie information, including release year, director, and reviews. |
| [sessions](https://www.mongodb.com/docs/manual/sample-data/sample-mflix.md#std-label-mflix-sessions) | Metadata field. Contains users' [JSON Web Tokens.](https://en.wikipedia.org/wiki/JSON_Web_Token) |
| [theaters](https://www.mongodb.com/docs/manual/sample-data/sample-mflix.md#std-label-mflix-theaters) | Contains locations of movie theaters. |
| [users](https://www.mongodb.com/docs/manual/sample-data/sample-mflix.md#std-label-mflix-users) | Contains user information. |

### `sample_mflix.comments`

This collection contains comments associated with specific movies. Each document contains the comment text, the user who submitted it, and the movie the comment applies to.

#### Indexes

This collection contains the following indexes:

| Name | Index | Description |
| --- | --- | --- |
| `_id_` | `{ "_id": 1 }` | Primary key index on the `_id` field. |

#### Sample Document

```json
{
  "_id": {
    "$oid": "5a9427648b0beebeb69579cc"
  },
  "name": "Andrea Le",
  "email": "andrea_le@fakegmail.com",
  "movie_id": {
    "$oid": "573a1390f29313caabcd418c"
  },
  "text": "Rem officiis eaque repellendus amet eos doloribus. Porro
    dolor voluptatum voluptates neque culpa molestias. Voluptate unde
    nulla temporibus ullam.",
  "date": {
    "$date": {
      "$numberLong": "1332804016000"
    }
  }
}
```

### `sample_mflix.embedded_movies`

This collection contains details on movies with `genres` of `Western`, `Action`, or `Fantasy`. Each document contains a single movie, and information such as its title, release year, and cast.

In addition, documents in this collection include the following fields:

- `plot_embedding_voyage_3_large` - Contains 2048d embeddings created from the `plot` field using Voyage AI's `voyage-3-large` embedding model and converted to `binData` for efficient storage and retrieval.

- `plot_embedding` - Contains 1536d embeddings created from the `plot` field using OpenAI's `text-embedding-ada-002` embedding model and converted to `binData` for efficient storage and retrieval.

#### Indexes

This collection contains the following indexes:

| Name | Index | Description |
| --- | --- | --- |
| `_id_` | `{ "_id": 1 }` | Primary key index on the `_id` field. |

#### Sample Document

**Note:**

The number of dimensions in the sample have been truncated for readability.

```json
{
  "_id": {
    "$oid": "573a1396f29313caabce582d"
  },
  "plot": "A young swordsman comes to Paris and faces villains, romance, adventure and intrigue with three Musketeer friends.",
  "genres": ["Action", "Adventure", "Comedy"],
  "runtime": {
    "$numberInt": "106"
  },
  "rated": "PG",
  "cast": ["Oliver Reed", "Raquel Welch", "Richard Chamberlain", "Michael York"],
  "num_mflix_comments": {
    "$numberInt": "0"
  },
  "poster": "https://m.media-amazon.com/images/M/MV5BODQwNmI0MDctYzA5Yy00NmJkLWIxNGMtYzgyMDBjMTU0N2IyXkEyXkFqcGdeQXVyMjI4MjA5MzA@._V1_SY1000_SX677_AL_.jpg",
  "title": "The Three Musketeers",
  "lastupdated": "2015-09-16 06:21:07.210000000",
  "languages": ["English"],
  "released": {
    "$date": {
      "$numberLong": "133747200000"
    }
  },
  "directors": ["Richard Lester"],
  "writers": ["George MacDonald Fraser (screenplay)", "Alexandre Dumas père (novel)"],
  "awards": {
    "wins": {
      "$numberInt": "4"
    },
    "nominations": {
      "$numberInt": "7"
    },
    "text": "Won 1 Golden Globe. Another 3 wins & 7 nominations."
  },
  "year": {
    "$numberInt": "1973"
  },
  "imdb": {
    "rating": {
      "$numberDouble": "7.3"
    },
    "votes": {
      "$numberInt": "11502"
    },
    "id": {
      "$numberInt": "72281"
    }
  },
  "countries": ["Spain", "USA", "Panama", "UK"],
  "type": "movie",
  "tomatoes": {
    "viewer": {
      "rating": {
        "$numberDouble": "3.5"
      },
      "numReviews": {
        "$numberInt": "9600"
      },
      "meter": {
        "$numberInt": "78"
      }
    },
    "dvd": {
      "$date": {
        "$numberLong": "982022400000"
      }
    },
    "critic": {
      "rating": {
        "$numberDouble": "7.1"
      },
      "numReviews": {
        "$numberInt": "11"
      },
      "meter": {
        "$numberInt": "82"
      }
    },
    "lastUpdated": {
      "$date": {
        "$numberLong": "1441307415000"
      }
    },
    "rotten": {
      "$numberInt": "2"
    },
    "production": "Live Home Video",
    "fresh": {
      "$numberInt": "9"
    }
  },
  "plot_embedding": Binary.createFromBase64('JwATQn+8iGwMvRuAeTwtiy6908...),
  "plot_embedding_voyage_3_large": Binary.createFromBase64('JwCnhcc7zQ1TPCq6QLuIdzM71sj...)
}
```

### `sample_mflix.movies`

This collection contains details on movies. Each document contains a single movie, and information such as its title, release year, and cast.

#### Indexes

This collection contains the following indexes:

| Name | Index | Description | Properties |
| --- | --- | --- | --- |
| `_id_` | `{ "_id": 1 }` | Primary key index on the `_id` field. | |
| `cast_text_fullplot_text_genres_text_title_text` | `{
                "_fts": "text",
                "_ftsx": 1
                }` | [Text index](https://www.mongodb.com/docs/manual/core/index-text/) on the `cast`, `fullplot`, `genres`, and `title` fields. | [Sparse](https://www.mongodb.com/docs/manual/core/index-sparse/) |

#### Sample Document

```json
{
  "_id": {
    "$oid": "573a1390f29313caabcd42e8"
  },
  "plot": "A group of bandits stage a brazen train hold-up, only to find a determined posse hot on their heels.",
  "genres": [
    "Short",
    "Western"
  ],
  "runtime": 11,
  "cast": [
    "A.C. Abadie",
    "Gilbert M. 'Broncho Billy' Anderson",
    "George Barnes",
    "Justus D. Barnes"
  ],
  "poster": "https://m.media-amazon.com/images/M/MV5BMTU3NjE5NzYtYTYyNS00MDVmLWIwYjgtMmYwYWIxZDYyNzU2XkEyXkFqcGdeQXVyNzQzNzQxNzI@._V1_SY1000_SX677_AL_.jpg",
  "title": "The Great Train Robbery",
  "fullplot": "Among the earliest existing films in American cinema - notable as the first film that presented a narrative story to tell - it depicts a group of cowboy outlaws who hold up a train and rob the passengers. They are then pursued by a Sheriff's posse. Several scenes have color included - all hand tinted.",
  "languages": [
    "English"
  ],
  "released": {
    "$date": {
      "$numberLong": "-2085523200000"
    }
  },
  "directors": [
    "Edwin S. Porter"
  ],
  "rated": "TV-G",
  "awards": {
    "wins": 1,
    "nominations": 0,
    "text": "1 win."
  },
  "lastupdated": "2015-08-13 00:27:59.177000000",
  "year": 1903,
  "imdb": {
    "rating": 7.4,
    "votes": 9847,
    "id": 439
  },
  "countries": [
    "USA"
  ],
  "type": "movie",
  "tomatoes": {
    "viewer": {
      "rating": 3.7,
      "numReviews": 2559,
      "meter": 75
    },
    "fresh": 6,
    "critic": {
      "rating": 7.6,
      "numReviews": 6,
      "meter": 100
    },
    "rotten": 0,
    "lastUpdated": {
      "$date": "2015-08-08T19:16:10.000Z"
    }
  },
  "num_mflix_comments": 0
}
```

### `sample_mflix.sessions`

This collection contains metadata about [users](https://www.mongodb.com/docs/manual/sample-data/sample-mflix.md#std-label-mflix-users). Each document contains a user and their corresponding [JSON Web Token](https://en.wikipedia.org/wiki/JSON_Web_Token)

#### Indexes

This collection contains the following indexes:

| Name | Index | Description | Properties |
| --- | --- | --- | --- |
| `_id_` | `{ "_id": 1 }` | Primary key index on the `_id` field. | |
| `user_id_1` | `{ "user_id" : 1}` | Ascending index on the `user_id` field. | [Unique](https://www.mongodb.com/docs/manual/core/index-unique/) |

#### Sample Document

```json
{
  "_id": {
    "$oid": "5a98348755593fdf68350932"
  },
  "user_id": "bfb9vc1zz@xhasq.5h9",
  "jwt": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### `sample_mflix.theaters`

This collection contains movie theater locations. Each document contains a single movie theater and its location in both string and [GeoJSON](https://www.mongodb.com/docs/manual/reference/geojson/) forms.

#### Indexes

| Name | Index | Description | Properties |
| --- | --- | --- | --- |
| `_id_` | `{ "_id": 1 }` | Primary key index on the `_id` field. | |
| `geo index` | `{ "location.geo": "2dsphere" }` | [Geospatial index](https://www.mongodb.com/docs/manual/geospatial-queries/#geospatial-indexes) on the `location.geo` field. | [Sparse](https://www.mongodb.com/docs/manual/core/index-sparse/) |

#### Sample Document

```json
{
  "_id": {
    "$oid": "59a47286cfa9a3a73e51e72c"
  },
  "theaterId": {
    "$numberInt": "1000"
  },
  "location": {
    "address": {
      "street1": "340 W Market",
      "city": "Bloomington",
      "state": "MN",
      "zipcode": "55425"
    },
    "geo": {
      "type": "Point",
      "coordinates": [
        {
          "$numberDouble": "-93.24565"
        },
        {
          "$numberDouble": "44.85466"
        }
      ]
    }
  }
}
```

### `sample_mflix.users`

This collection contains information on `mflix` users. Each document contains a single user, and their name, email, and password.

#### Indexes

| Name | Index | Description | Properties |
| --- | --- | --- | --- |
| `_id_` | `{ "_id": 1 }` | Primary key index on the `_id` field. | |
| `email_1` | `{ "email: 1 }` | Unique, ascending index on the `email` field. | [Unique](https://www.mongodb.com/docs/manual/core/index-unique/) |

#### Sample Document

```json
{
  "_id": {
    "$oid": "59b99db4cfa9a34dcd7885b6"
  },
  "name": "Ned Stark",
  "email": "sean_bean@gameofthron.es",
  "password": "$2b$12$UREFwsRUoyF0CRqGNK0LzO0HM/jLhgUCNNIJ9RJAqMUQ74crlJ1Vu"
}
```
