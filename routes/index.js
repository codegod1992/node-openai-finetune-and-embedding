/**
 * Redirects to the `index.html` page.
 *
 * This function simply returns a `302` HTTP status and redirects
 * to the `public/index.html` file.
*/
var exec = require('child_process').exec;
const fs = require('fs/promises');
const similarity = require( 'compute-cosine-similarity' );
const { Configuration, OpenAIApi } = require("openai");
const { response } = require('express');
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function sh(cmd) {
    return new Promise(function (resolve, reject) {
      exec(cmd, (err, stdout, stderr) => {
        if (err) {
          reject(err);
        } else {
          resolve({ stdout, stderr });
        }
      });
    });
}
// var textToBeSummarized = "Jupiter is the fifth planet from the Sun and the largest in the Solar System. It is a gas giant with a mass one-thousandth that of the Sun, but two-and-a-half times that of all the other planets in the Solar System combined. Jupiter is one of the brightest objects visible to the naked eye in the night sky, and has been known to ancient civilizations since before recorded history. It is named after the Roman god Jupiter.[19] When viewed from Earth, Jupiter can be bright enough for its reflected light to cast visible shadows,[20] and is on average the third-brightest natural object in the night sky after the Moon and Venus."
var trainData = [
    { name: "Colleen Delgado", country: "United States", city: "New York", salary: "120000"},
    { name: "Michael Kornblum", country: "United States", city: "buffalo", salary: "110000"},
    { name: "John Martin", country: "United States", city: "Los Angeles", salary: "130000"},
    { name: "Filip Jawaski", country: "Poland", city: "Warsaw", salary: "125000"},
    { name: "Kevin Johnson", country: "United States", city: "Brandom", salary: "131000"},
]
var jsonlfile = [
    {"prompt": "About Colleen Delgado?\n\n###\n\n", "completion": "country: 'United States', city: 'New York', salary: '120000'\n"},
    {"prompt": "About Michael Kornblum?\n\n###\n\n", "completion": "country: 'United States', city: 'buffalo', salary: '110000'\n"},
    {"prompt": "About John Martin?\n\n###\n\n", "completion": "country: 'United States', city: 'Los Angeles', salary: '130000'\n"},
    {"prompt": "About Filip Jawaski?\n\n###\n\n", "completion": "country: 'Poland', city: 'Warsaw', salary: '125000'\n"},
    {"prompt": "About Kevin Johnson?\n\n###\n\n", "completion": "country: 'United States', city: 'Brandom', salary: '131000'\n"},
   
]
exports.index = function( request, response ) {
    
    response.statusCode = 302;
    response.setHeader("Location", "/index.html");
    response.end('<p>302. Redirecting to index.html</p>');
};

exports.finetune = async function( request, response )
{
  //Parameters-> ObjectArray: {[],[]...}
  //return-> finetuned model: String
  var jsonlfile = []
  trainData.forEach(element => {
    var temp = {"prompt": "", "completion":""}
    temp.prompt = "About " + element.name + "?\n\n###\n\n"
    temp.completion = "country: '" + element.country + "', city: '" + element.city + "', salary: '" + element.salary + "'\n"
    jsonlfile.push(temp)
    temp.prompt = element.name + "?\n\n###\n\n"
    jsonlfile.push(temp)
  });
  jsonlfile.forEach(async element => {
      await fs.writeFile('test.jsonl', JSON.stringify(element)+"\n", { flag: 'a+' });
  });
  try {
    sh("openai api fine_tunes.create -t test.jsonl -m davinci")
    .then(async(stdout) => {
      var cmdStr = ""
      while(cmdStr.search("succeeded") < 0)
      {
        console.log(stdout.split("\r\n"))
        cmdStr = await sh(stdout.split("\r\n")[stdout.split("\r\n").length-3])
      }
      resultStr = cmdStr.split("\r\n")[cmdStr.split("\r\n").length - 4].split(":")
  
      console.log("cmdStr::", cmdStr, " splited::", cmdStr.split("\r\n"))
      console.log("resultstr::", resultStr)
      console.log("returnStr::", resultStr[resultStr.length-2] + ":" + resultStr[resultStr.length-1])
      
      response.end({"code": 200, "message": "success", "body": resultStr[resultStr.length-2] + ":" + resultStr[resultStr.length-1]})    
      console.log(stdout)
    })
  } catch (error) {
    response.end({"code": 500, "message": "failed", "body": error})    
  }

    // while fineTuneConfirm.find("succeeded") < 0:
    //     print("#########", fineTuneConfirm.split("\n"))
    //     fineTuneConfirm = out(fineTuneConfirm.split("\n")[-3])


    // for (let line of stdout.split('\n')) {
    //     console.log(`${line}`);
    // }
}
exports.testcompletion = async function( request, response )
{
  //parameters-> prompt(question) : String, modelID : String
  //return-> completion(answer): String 
  var modelID = "text-davinci-003"
  try {
    res = await openai.createCompletion({
      model: modelID,
      prompt: "convert to node.js code from this python code: all_answers = '\n\n'.join(answers)", 
      temperature: 0, 
      max_tokens: 64,
      top_p: 1.0,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
    });
  } catch (error) {
    console.log("openaikeyyyyyyyyyy", process.env.OPENAI_API_KEY)
    console.log("eeeeeeeeeeereeeeeeee", error)
    response.end({"code": 500, "message": "failed", "body": error})    
  }
   response.end(res.data.choices[0].text)    
}

async function gpt3_embedding(content) {
  const response = await openai.createEmbedding({
    model: "text-embedding-ada-002",
    input: content
  });
  console.log("response-------------", response.data.data[0].embedding)
  return response.data.data[0].embedding
  
}

const formatTextWrap = (text, maxLineLength) => {
  const words = text.replace(/\r\n+/g, ' ').split(' ');
  let lineLength = 0;
  
  // use functional reduce, instead of for loop 
  return words.reduce((result, word) => {
    if (lineLength + word.length >= maxLineLength) {
      lineLength = word.length;
      return result + `\n${word}`; // don't add spaces upfront
    } else {
      lineLength += word.length + (result ? 1 : 0);
      return result ? result + ` ${word}` : `${word}`; // add space only when needed
    }
  }, '');
}

exports.makeIndexFile = async function( request, response)
{

  let chunks = wordWrapToStringList(JSON.stringify(trainData), 4000);
  let result = [];
  console.log("asdffffffffffff", chunks)
  for (let chunk of chunks) {
      let embedding = await gpt3_embedding(chunk);
      let info = {'content': chunk, 'vector': embedding};
      console.log(info, '\n\n\n');
      result.push(info);
  } 
  fs.writeFile('index.json', JSON.stringify(result), { flag: 'w+' }, err => {});
  response.status(200).json(result);
}

const  openFile = async (filepath) => 
{
  const data = await fs.readFile(filepath, { encoding: 'utf8' });
  console.log("datadatadat", data.toString())
  return data.toString()
}
const getSimilarity = async (v1, v2) => {
  similarity(v1, v2,)
}
const search_index = async (text, data) =>
{
  var vector = await gpt3_embedding(text)
  var scores = []
  data.forEach(async i => {
    var score = similarity(vector, i.vector)
    console.log("score-----------", score)
    scores.push({'content': i.content, 'score': score})
  });
  var ordered = scores.sort((a, b) => b.score - a.score);
  console.log("ordered-----------", ordered)
  return ordered.slice(0, 5)
}

const gpt3_completion = async (prompt, engine='text-davinci-002', temp=0.6, top_p=1.0, tokens=2000, freq_pen=0.25, pres_pen=0.0, stop=['<<END>>']) => 
{
  var max_retry = 5
  var retry = 0
  while(true)
  {
    try {
      res = await openai.createCompletion({
        model: engine,
        prompt: prompt, 
        temperature: temp,
        max_tokens: tokens,
        top_p: top_p,
        frequency_penalty: freq_pen,
        presence_penalty: pres_pen,
      });
      var text = res.data.choices[0].text.trim()
      text = text.replace(/\s+/g, ' ')
      return text
    } catch (err) {
      retry ++
      if (retry >= max_retry)
        return "GPT3 error: %s" % err
      console.log('Error communicating with OpenAI:', err)
      setTimeout(() => {}, 1);
    }
  }
}

function wordWrapToStringList (text, maxLength) {
  var result = [], line = [];
  var length = 0;
  text.split(" ").forEach(function(word) {
      if ((length + word.length) >= maxLength) {
          result.push(line.join(" "));
          line = []; length = 0;
      }
      length += word.length + 1;
      line.push(word);
  });
  if (line.length > 0) {
      result.push(line.join(" "));
  }
  return result;
};
exports.question_answer = async function( request, response )
{
  var data = JSON.parse(await openFile('index.json'))
  var query = "who is People with an salary of 125,000? "
  var results = await search_index(query, data)
  var answers = []
  var all_answers = ''
  console.log("results-------------", results)
  results.forEach(async result => {
    var prompt = (await openFile('prompt_answer.txt')).replace('<<PASSAGE>>',  result.content).replace('<<QUERY>>', query)
    var answer = await gpt3_completion(prompt)
    console.log('\n\n', answer)
    answers.push(answer)
    all_answers += " " + answer.toString()
  })
  var chunks = wordWrapToStringList(all_answers, 10000)
  var final = []
  var resultStr = ''
  chunks.forEach(async chunk => {
    prompt = (await openFile('prompt_summary.txt')).replace('<<SUMMARY>>', chunk)
    var summary = gpt3_completion(prompt)
    final.push(summary)
    resultStr += summary.toString()
  });
  console.log("\n\n=========\n\n", resultStr)
  response.end(resultStr);
}