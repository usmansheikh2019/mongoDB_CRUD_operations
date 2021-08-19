const { MongoClient } = require("mongodb");
async function main() {
  const url = "mongodb://127.0.0.1:27017";

  // creating new mongo client instance
  const client = new MongoClient(url);

  //connect
  try {
    await client.connect();

    /***********************************************/
    //Deleting multiple listings
    await deleteNonEligibleStudents(client, 40);
    /***********************************************/

    /***********************************************/
    //Deleting a single listing
    //await deleteListingByName(client, "israr ahmed");
    /***********************************************/

    /***********************************************/
    //update many operation *(all documents must have a field rollNumber)
    // await updateAllListingsToHaveRollNumber(client);
    /***********************************************/

    /***********************************************/
    // upserting documents with name query
    // await upsertListingByName(client, "israr ahmed", {
    //   seatNumber: 313,
    // });
    /***********************************************/

    /***********************************************/
    //updating a single listing by name query
    // await updateListingByName(client, "wahaj", { age: 30, score: 30 });
    /***********************************************/

    /*********************************************/
    // finding single documet
    //await findOneListingByName(client, "usman");
    /*********************************************/

    /***********************************************/
    // finding multiple documets having same values
    //await findMultiListing(client, "usman");
    /***********************************************/

    /***********************************************/
    //Finding specific multi documents
    // await findSpecificMultiListing(client, {
    //   eligibleAge: 30,
    //   eligibleScore: 90,
    //   maximumResults: 4,
    // });
    /***********************************************/

    /***********************************************/
    // List all databases
    //await listDatabases(client);
    /***********************************************/

    /***********************************************/
    //Create Listing
    // await createListing(client, [
    //   {
    //     name: "usman",
    //     age: 20,
    //     score: 15,
    //   },
    //   {
    //     name: "hammad",
    //     age: 21,
    //     score: 30,
    //   },
    //   {
    //     name: "wahaj",
    //     age: 23,
    //     score: 35,
    //   },
    //   {
    //     name: "sharjeel",
    //     age: 25,
    //     score: 40,
    //   },
    //   {
    //     name: "asad",
    //     age: 26,
    //     score: 50,
    //   },
    //   {
    //     name: "hassan",
    //     age: 28,
    //     score: 52,
    //   },
    //   {
    //     name: "affan",
    //     age: 29,
    //     score: 60,
    //   },
    //   {
    //     name: "usman",
    //     age: 29,
    //     score: 70,
    //   },
    //   {
    //     name: "hamza",
    //     age: 30,
    //     score: 80,
    //   },
    //   {
    //     name: "usman",
    //     age: 31,
    //     score: 91,
    //   },
    // ]);
    /***********************************************/
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

main().catch(console.error);

//Delete single listing operation
async function deleteListingByName(client, nameOfListing) {
  const result = await client
    .db("myDB")
    .collection("enrollment")
    .deleteOne({ name: nameOfListing });
  console.log(`${result.deletedCount} document(s) was/were deleted`);
}

//Delete multiple listings
// Delete students from database who scored less then 40
async function deleteNonEligibleStudents(client, eligibleScore) {
  const result = await client
    .db("myDB")
    .collection("enrollment")
    .deleteMany({ score: { $lt: eligibleScore } });
  console.log(`${result.deletedCount} document(s) was/were deleted`);
}

//update many operation
// make sure all documents have field name rollNumber
async function updateAllListingsToHaveRollNumber(client) {
  const result = await client
    .db("myDB")
    .collection("enrollment")
    .updateMany(
      { rollNumber: { $exists: false } },
      { $set: { rollNumber: "Applied for" } }
    );
  console.log(`${result.matchedCount} document(s) matched the query criteria`);
  console.log(`${result.modifiedCount} document(s) was/were updated`);
}

//upsert operation
// upsert can update the documents if already exist and can create documents if not exist
async function upsertListingByName(client, nameOfListing, updatedListing) {
  const result = await client.db("myDB").collection("enrollment").updateOne(
    { name: nameOfListing },
    {
      $set: updatedListing,
    },
    { upsert: true }
  );
  console.log(`${result.matchedCount} document(s) matched the query`);
  if (result.upsertedCount > 0) {
    console.log(`Document inserted with id: ${result.upsertedId}`);
  } else {
    console.log(`${result.modifiedCount} documets were/was updated`);
  }
}

// update operation (name query)
async function updateListingByName(client, nameOfListing, updatedListing) {
  const result = await client.db("myDB").collection("enrollment").updateOne(
    { name: nameOfListing },
    {
      $set: updatedListing,
    }
  );
  console.log(`${result.matchedCount} document(s) matched the criteria`);
  console.log(`${result.modifiedCount} document(s) was/were updated`);
}

// query for one document
async function findOneListingByName(client, nameOfListing) {
  const result = await client
    .db("myDB")
    .collection("profiles")
    .findOne({ name: nameOfListing });
  if (result.length > 0) {
    console.log(`Found a listing with a name: ${nameOfListing}`);
    console.log(result);
  } else {
    console.log(`No listing found with the name: ${nameOfListing}`);
  }
}

// Find query for multiple documents (0.0)
// Take the following example
// Q) find documents that has key value of name: 'usman'
async function findMultiListing(client, nameOfListing) {
  const result = await client
    .db("myDB")
    .collection("enrollment")
    .find({
      name: nameOfListing,
    })
    .toArray();
  if (result) {
    result.forEach((result, i) => {
      console.log(`Listing ${i + 1}`);
      console.log(`id: ${result._id}`);
      console.log(`name: ${result.name}`);
      console.log(`age: ${result.age}`);
      console.log(`score: ${result.score}`);
      console.log(`\n`);
    });
  } else {
    console.log(`No listings found with name: ${nameOfListing}`);
  }
}

// Find query for multiple documents (0.1)
// Take the following example
//  I want 3 student of minimum age 23 and having minimum score of 40
async function findSpecificMultiListing(
  client,
  {
    eligibleAge = 23,
    eligibleScore = 40,
    maximumResults = Number.MAX_SAFE_INTEGER,
  } = {}
) {
  const cursor = await client
    .db("myDB")
    .collection("enrollment")
    .find({
      age: { $gte: eligibleAge },
      score: { $gte: eligibleScore },
    })
    .sort({ last_edited: -1 })
    .limit(maximumResults);
  console.log(cursor);
  // const result = await cursor.toArray();
  if (result) {
    result.forEach((result, i) => {
      console.log(`Listing ${i + 1}`);
      console.log(`id: ${result._id}`);
      console.log(`name: ${result.name}`);
      console.log(`age: ${result.age}`);
      console.log(`score: ${result.score}`);
      console.log(`\n`);
    });
  } else {
    console.log(
      `No documents found with minimum age ${eligibleAge} and minimum score ${eligibleScore}`
    );
  }
}

//create multiple listings
async function createListing(client, newListing) {
  const result = await client
    .db("myDB")
    .collection("enrollment")
    .insertMany(newListing);
  console.log(`${result.insertedCount} new listings created`);
  console.log(result.insertedIds);
}

//To list all databases
async function listDatabases(client) {
  const databasesList = await client.db().admin().listDatabases();
  databasesList.databases.forEach(element => {
    console.log(`- ${element.name}`);
  });
}
