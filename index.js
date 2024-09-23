import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
const app = express();
const port = 3000;
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: "2004",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
async function checkvisiste() {
  let visited = [];
  const result = await db.query("SELECT country_code FROM visited_countary");
  result.rows.forEach((country) => {
    visited.push(country.country_code);
  });
  return visited;
}

app.get("/", async (req, res) => {
  const visited = await checkvisiste();

  res.render("index.ejs", {
    countries: visited,
    total: visited.length,
    
   
  });
 
});

app.post("/add", async (req, res) => {
  const input = req.body["country"];
  try {
    const result = await db.query(
      "SELECT country_code FROM countries WHERE LOWER(country_name)  ILIKE '%' || $1 || '%';",
      [input]
    );
    const data = result.rows[0];
    const countryCode = data.country_code;

    try{
      
      await db.query("INSERT INTO visited_countary (country_code) VALUES ($1)", [
        countryCode,
      ]);
      res.redirect("/");

    }catch(error)
    {
      const visited = await checkvisiste();
      res.render("index.ejs", {
        countries: visited,
        total: visited.length,
        error:"Already Exist"
        
      });

    }
  } catch (error) {
    const visited = await checkvisiste();
    
  res.render("index.ejs", {
    countries: visited,
    total: visited.length,
    error:"Enter VAlid Country Name"
  });
    
  }
 
  
  
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
