> For the complete MongoDB documentation index, see www.mongodb.com/docs/llms.txt

# TypeScript Features and Limitations

## Overview

In this guide, you can learn about the **TypeScript** features and limitations of the MongoDB Node.js driver. TypeScript is a strongly typed programming language that compiles to JavaScript.

The TypeScript compiler offers type checking in real time. Code editors that support TypeScript can provide autocomplete suggestions, display documentation inline, and identify type-related errors.

All TypeScript features of the driver are optional. All valid JavaScript code written with the driver is also valid TypeScript code.

For more information, see the [TypeScript website.](https://www.typescriptlang.org/)

## Features

If you use TypeScript, you can specify a type for some classes in the driver. All classes that accept a type parameter in the driver have the default type `Document`. The `Document` interface has the following definition:

```typescript
interface Document {
  [key: string]: any;
}
```

All object types extend the `Document` interface.

For more information on object types, see the [TypeScript handbook.](https://www.typescriptlang.org/docs/handbook/2/objects.html)

### Type Parameters that Extend Document

The following classes accept all types that extend the `Document` interface:

- [Collection](https://mongodb.github.io/node-mongodb-native/7.6/classes/Collection.html)

- [ChangeStream](https://mongodb.github.io/node-mongodb-native/7.6/classes/ChangeStream.html)

You can pass a type parameter that extends the `Document` interface like this:

```typescript
interface Pet {
  name: string;
  age: number;
}

const database = client.db("<your database>");
const collection = database.collection<Pet>("<your collection>");

```

**Important: Keys Not in Type Parameter Receive any Type**

Keys not listed in your specified type parameter receive the `any` type. The following code snippet demonstrates this behavior:

```typescript
interface User {
  email: string;
}

const database = client.db("<your database>");
const myColl = db.collection<User>("<your collection>");
myColl.find({ age: "Accepts any type!" });
```

### Type Parameters of Any Type

The following classes accept all type parameters:

- [FindCursor](https://mongodb.github.io/node-mongodb-native/7.6/classes/FindCursor.html)

- [AggregationCursor](https://mongodb.github.io/node-mongodb-native/7.6/classes/AggregationCursor.html)

You can find a code snippet that shows how to specify a type for the `FindCursor` class in the [find() Example: Full File](https://www.mongodb.com/docs/drivers/node/current/crud/query/retrieve.md#std-label-node-driver-find-usage-example-code-snippet) section of the [Find Documents](https://www.mongodb.com/docs/drivers/node/current/crud/query/retrieve.md#std-label-node-find) guide.

### Type Safety and Dot Notation

Starting in version 5.0, by default, the Node.js driver does not provide type safety for operations that search on fields expressed in **dot notation**. Dot notation is a syntax you can use to navigate nested JSON objects. When you construct a filter to pass to a query, the driver will not raise a type error even if you specify an incorrectly typed value for a field expressed in dot notation.

The following code snippet defines the `ClassificationPet` interface, which includes a `classification` field that enables you to specify the genus and color of dogs and cats:

```typescript
interface ClassificationPet {
  name: string;
  age: number;
  classification: { genus: "Canis" | "Felis"; color: string };
}
```

The driver does not raise a type error for the following code sample, even though the value of `classification.color` is a boolean instead of a string:

```typescript
await myColl.findOneAndDelete({ "classification.color": false });
```

You can enable type-checking by constructing filters as `StrictFilter` or `StrictUpdateFilter` types.

**Warning:**

The `StrictFilter` and `StrictUpdateFilter` types are experimental and might incorrectly show type errors in valid queries.

In the following code sample, the filter is assigned a `StrictFilter` type. Given this filter type, the Node.js driver reports a type error because the value of `classification.color` is a boolean instead of a string.

```typescript
const filterPredicate: StrictFilter<ClassificationPet> = { "classification.color": false };
await myColl.findOneAndDelete(filterPredicate);
```

The following example assigns a `StrictUpdateFilter` type to an update filter. The Node.js driver reports a type error because the value of `classification.color` is a boolean instead of a string.

```typescript
const updateFilter: StrictUpdateFilter<ClassificationPet> = { $set: { "classification.color": false } }
await pets.updateOne({}, updateFilter);
```

#### Referencing Keys that Incorporate Variables

To query a collection or perform another operation with a key that incorporates variables, you must use an `as const` assertion when specifying the key. This mechanism allows your code to compile successfully if the input types are correct.

The following code snippet defines the `ClassificationPet` interface and the `Mealtime` interface. `ClassificationPet` includes a `mealtimes` field that contains an array of `Mealtime` interfaces, each of which includes a `time` field:

```typescript
interface ClassificationPet {
  name: string;
  mealtimes: Mealtime[];
}

interface Mealtime{
  time: string;
  amount: number;
}
```

The following code snippet performs a find-and-update operation on a collection of `ClassificationPet` documents. The operation updates the nested `time` field of the `Mealtime` instance at index `1`. The index position is specified by the variable `mealCounter`:

```typescript
const mealCounter = 1;

await myColl.findOneAndUpdate(
  { name: "Lassie" },
  { $set: { [`mealtimes.${mealCounter}.time` as const]: '04:00 PM' } },
);
```

To learn more about dot notation, see [Dot Notation](https://www.mongodb.com/docs/manual/core/document/#dot-notation) in the MongoDB manual.

To learn more about the limitations of dot notation in the Node.js driver, see the [Recursive Types and Dot Notation](https://www.mongodb.com/docs/drivers/node/current/typescript.md#std-label-node-driver-recursive-types-dot-notation) section.

## Working with the \_id Field

MongoDB does not recommend specifying the `_id` as a part of your model. Omitting the `_id` field makes the model more generic and reusable and more accurately models the data important to an application. The Node.js driver’s TypeScript integration takes care of adding the `_id` field to the return types for relevant methods.

The following sections provide information about write and read operations that use the `_id` field.

### Insert Operations and the \_id Field

How you specify the `_id` field in type parameters passed to your `Collection` instance affects the behavior of insert operations. The following table describes how different `_id` field specifications affect insert operations:

| `_id` field type | Example Type | Required on insert | Behavior on insert |
| --- | --- | --- | --- |
| Unspecified | Not applicable | No | The driver creates an [ObjectId](https://www.mongodb.com/docs/manual/reference/method/ObjectId/) value for each inserted document. |
| Specified | `{ _id: number };` | Yes | If you do not specify a value for the `_id` field in an insert operation, the driver raises an error. |
| Specified as optional | `{ _id?: number };` | No | If you do not specify the `_id` field in an insert operation, the driver adds an `_id` field value generated by the [primary key factory](https://www.mongodb.com/docs/drivers/node/current/crud/insert.md#std-label-id-note). |

If you must specify the `_id` field as required in the type you define to represent documents in your collection but you do not want to specify values for the `_id` field in insert operations, use the `OptionalId` helper type when you create your collection. The `OptionalId` type accepts a type parameter as an argument and returns that type with an optional `_id` field.

The following code snippet defines the `IdPet` interface, which includes a type for the `_id` field:

```typescript
interface IdPet {
  _id: ObjectId;
  name: string;
  age: number;
}
```

The following code uses the preceding interface and the `OptionalId` type to insert a document without specifying a value for the `_id` field:

```typescript
const database = client.db("<your database>");
const collection = db.collection<OptionalId<IdPet>>("<your collection>");

myColl.insertOne({
  name: "Spot",
  age: 2
});
```

To learn more about the `_id` field, see [The \_id Field](https://www.mongodb.com/docs/manual/core/document/#the-_id-field) in the MongoDB manual.

To learn more about the types, interfaces, and classes discussed in this section, see the following resources:

- [OptionalId](https://mongodb.github.io/node-mongodb-native/7.6/modules.html#OptionalId) API documentation

- [PkFactory](https://mongodb.github.io/node-mongodb-native/7.6/interfaces/PkFactory.html) API documentation

- [ObjectId](https://github.com/mongodb/js-bson/blob/master/src/objectid.ts) source code

### Find Methods and the \_id Field

The `find` and `findOne` methods of the `Collection` class include the `_id` field in their return type. The driver infers the type of the returned `_id` field based on the type parameter you passed to your `Collection` instance.

If the type parameter you passed to your `Collection` instance includes the `_id` field in its schema, the driver infers that the `_id` field returned from the method is of the type specified in the schema.

However, if the type parameter you passed to your `Collection` instance does not include the `_id` field in its schema, the driver infers that the type of the `_id` field returned from the method is `ObjectId`.

**Tip:**

The type parameter passed to your `Collection` influences only the type inference of the fields returned from the method. The driver does not convert the field to the specified type. The type of each field in your type parameter's schema must match the type of the corresponding field in the collection.

The following code uses the [Pet](https://www.mongodb.com/docs/drivers/node/current/typescript.md#std-label-mongodb-node-typescript-pet-interface) interface to return a document with an `_id` inferred to be of type `ObjectId`:

```typescript
const database = client.db("<your database>");
const collection = db.collection<Pet>("<your collection>");

const document = await myColl.findOne({
  name: "Spot",
});
const id : ObjectId = document._id;
```

The following code uses the `IdNumberPet` interface to return a document with an `_id` inferred to be of type `number`:

```typescript
interface IdNumberPet {
  _id: number;
  name: string;
  age: number;
}

const database = client.db("<your database>");
const collection = db.collection<IdNumberPet>("<your collection>");

const document = await myColl.findOne({
  name: "Spot",
});
const id : number = document._id;
```

**Important: Projection**

If you specify a [projection](https://www.mongodb.com/docs/drivers/node/current/crud/query/project.md#std-label-mongodb-node-projection) in a find method, you must pass a type parameter to your find method that reflects the structure of your projected documents. Without a type parameter, TypeScript cannot check at compile time that you are using your projected documents safely.

To show this behavior, the following code snippet passes type checking but raises an error at runtime:

```typescript
const doc = await myColl.findOne(
  {},
  { projection: { _id: 0, name: 1 } }
);
console.log(doc._id.generationTime);
```

To catch this error at compile time, pass a type parameter that does not include the `_id` field to your find method:

```typescript
interface ProjectedDocument {
   name: string
}

const doc = await myColl.findOne<ProjectedDocument>(
  {},
  { projection: { _id: 0, name: 1 } }
);
// Compile time error: Property '_id' does not exist on type 'ProjectedDocument'.
console.log(doc._id.generationTime);
```

To view a runnable TypeScript example that includes a find method applying a projection, see the [Find a Document](https://www.mongodb.com/docs/drivers/node/current/crud/query/retrieve.md#std-label-node-driver-findone-usage-example-code-snippet) page.

To learn more about the classes and methods discussed in this section, see the following API documentation:

- [Collection](https://mongodb.github.io/node-mongodb-native/7.6/classes/Collection.html)

- [find](https://mongodb.github.io/node-mongodb-native/7.6/classes/Collection.html#find)

- [findOne](https://mongodb.github.io/node-mongodb-native/7.6/classes/Collection.html#findOne)

## Known Limitations

Learn about the following TypeScript specific limitations of the Node.js driver:

- [No type safety for dot notation references to nested instances of recursive types](https://www.mongodb.com/docs/drivers/node/current/typescript.md#std-label-node-driver-recursive-types-dot-notation)

- [Depth limitations on type safety for mutually recursive types](https://www.mongodb.com/docs/drivers/node/current/typescript.md#std-label-node-driver-limitations-mutual-recursion)

### Recursive Types and Dot Notation

The Node.js driver cannot provide type safety within nested instances of **recursive types** referenced through dot notation.

A recursive type is a type that references itself. You can update the [Pet](https://www.mongodb.com/docs/drivers/node/current/typescript.md#std-label-mongodb-node-typescript-pet-interface) interface to be recursive by allowing a pet to have its own pet. The following is the recursive `Pet` interface:

```typescript
interface RecursivePet {
   pet?: RecursivePet;
   name: string;
   age: number;
}
```

**Note: Depth Limit**

The Node.js driver does not traverse nested recursive types when type checking dot notation keys to avoid hitting TypeScript's recursive depth limit.

The following code snippet references a nested instance of the [RecursivePet](https://www.mongodb.com/docs/drivers/node/current/typescript.md#std-label-node-driver-limitations-recursive-pet) interface with an incorrect type using dot notation, but the TypeScript compiler does not raise a type error:

```typescript
database
   .collection<RecursivePet>("<your collection>")
   .findOne({ "pet.age": "Spot" });
```

The following code snippet references a top-level instance of the `RecursivePet` interface with an incorrect type and raises a type error:

```typescript
database
   .collection<RecursivePet>("<your collection>")
   .findOne({ pet: "Spot" });
```

The error raised by the preceding code snippet is as follows:

```none
index.ts(19,59): error TS2769: No overload matches this call.
The last overload gave the following error.
Type 'string' is not assignable to type 'Condition<Pet>'.
```

If you must have type safety within nested instances of recursive types, you must write your query or update without dot notation.

To learn more about dot notation, see [Dot Notation](https://www.mongodb.com/docs/manual/core/document/#dot-notation) in the MongoDB manual.

### Mutual Recursion

A  **mutually recursive**  type exists when two types contain a property that is of the other's type. You can update the [Pet](https://www.mongodb.com/docs/drivers/node/current/typescript.md#std-label-mongodb-node-typescript-pet-interface) interface to be mutually recursive by allowing a pet to have a handler, and defining a handler to have a pet. The following examples reference the mutually recursive `Pet` and `Handler` interfaces:

```typescript
interface Pet {
   handler?: Handler;
   name: string;
   age: number;
}

interface Handler {
   pet: Pet;
   name: string;
}
```

The Node.js driver provides type safety for mutually recursive types referenced through dot notation up to a depth of eight. The following code snippet assigns a `string` to a `number` and raises a type error because the referenced property is at a depth of four:

```typescript
database
   .collection<Pet>("<your collection>")
   .findOne({'handler.pet.handler.pet.age': "four"});
```

The error raised by the preceding code snippet is as follows:

```none
index.ts(19,59): error TS2769: No overload matches this call.
The last overload gave the following error.
Type 'string' is not assignable to type 'Condition<number> | undefined'.
```

At a depth greater than or equal to eight, TypeScript compiles your code but no longer type checks it. The following code assigns a `string` to a `number` property but does not cause a compilation error because the referenced property is at a depth of 10:

```typescript
database
   .collection<Pet>("<your collection>")
   .findOne({'handler.pet.handler.pet.handler.pet.handler.pet.handler.pet.age': "four"});
```
