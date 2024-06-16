const express = require('express');
const { Client } = require('@notionhq/client');
const app = express();
require('dotenv').config();

app.set('view engine', 'ejs');

const notion = new Client({ auth: process.env.NOTION_KEY });


async function getPageContent(pageId) {
    try {
      const response = await notion.blocks.children.list({
        block_id: pageId,
        page_size: 100,
      });
  
      return response.results;
    } catch (error) {
      console.error(error);
    }
  }
  
  // Function to find the inline database in the page content
  async function findInlineDatabase(pageId) {
    const pageContent = await getPageContent(pageId);
  
    for (const block of pageContent) {
      if (block.type === 'child_database') {
        const databaseId = block.id;
        console.log(`Found inline database with ID: ${databaseId}`);
        return databaseId;
      }
    }
  
    console.log('No inline database found on this page.');
    return null;
  }


app.get('/', async (req, res) => {
    //const database_id = '33ddbf0624cd4435be669a60ebed49be';
    const database_id = '261c30aa25d649898320e41125292a9a';
    const response = await notion.databases.query({ database_id: database_id });
    const data = response.results;
    //console.log(data[0]);
    const page_id = data[0].id;
    //console.log(data[0].id);
    //const response2 = await notion.databases.query({ database_id: database_id2 });
    //const data2 = response2.results;
    const database_month_id = await findInlineDatabase(page_id);
    console.log(database_month_id);
    const response2 = await notion.databases.query({ database_id: database_month_id });

    //const response2 = await notion.pages.retrieve({ page_id: page_id });
    const data2 = response2.results;
    console.log(data2[0].properties);
    res.render('index', { data2 });
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
