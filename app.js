const express = require("express");
const bodyparser = require("body-parser");
const dot = require("dotenv");
const { Configuration, OpenAIApi } = require("openai");

const app = express();
dot.config();

app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

// Handling the open ai API
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

async function handleRequest(req, res) {
  let result;
  if (!configuration.apiKey) {
    console.log("Api configuration error");
    return;
  }
  const animal = req.body.animal || "";
  if (animal.trim().length === 0) {
    res.status(400).send("<h1>Invalid Animal Name</h1>");
    return;
  }
  try {
    const category = req.body.category;
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: generatePrompt(animal, category),
      temperature: 0.6,
    });
    result = completion.data.choices[0].text;
    res.render("result", { result: result });
  } catch (error) {
    // Consider adjusting the error handling logic for your use case
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: "An error occurred during your request.",
        },
      });
    }
  }
}
// Generate the names
function generatePrompt(animal, category) {
  const capitalizedAnimal =
    animal[0].toUpperCase() + animal.slice(1).toLowerCase();
  return `Suggest three names for an animal that is a ${category}.
  
  Animal: Cat
  Names: Captain Sharpclaw, Agent Fluffball, The Incredible Feline
  Animal: Dog
  Names: Ruff the Protector, Wonder Canine, Sir Barks-a-Lot
  Animal: ${capitalizedAnimal}
  Names:`;
}

app.get("/", (req, res) => {
  res.render("home");
});

// Route incoming POST requests to the home route to the handleRequest function
app.post("/", handleRequest);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
