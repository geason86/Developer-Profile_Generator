var fs = require('fs');
const convertFactory = require('electron-html-to');
const axios = require("axios");
const inquirer = require("inquirer");
const generateHTML = require("./generateHTML.js");
const open = require("open");
const path = require("path")

function promptUser() {
inquirer.prompt([
    {
    type: "input",
    message: "Enter your GitHub username:",
    name: "username"
    },
    {
    type: "list",
    name: "color",
    message: "What color would you like?",
    choices: ["green", "blue", "pink", "red"]
    }
])
  .then(function({ username, color }) {
    const queryUrl = `https://api.github.com/users/${username}`;

    axios.get(queryUrl)
    .then( ({data}) => {
      getStars(username)
        .then(stars => {
          return generateHTML({data, color, stars})
        })
        .then(html => {
          var conversion = convertFactory({
            converterPath: convertFactory.converters.PDF
          });
           
          conversion({ html }, function(err, result) {
            if (err) {
              return console.error(err);
            }
           
            console.log(result.numberOfPages);
            console.log(result.logs);
            result.stream.pipe(
              fs.createWriteStream(path.join(__dirname, "resume.pdf"))
              );

            conversion.kill();
            
            
          })
          open(path.join(process.cwd(), "resume.pdf"));
        
         
        })
      // let profileImage = res.data.avatar_url;
      // console.log(profileImage);
      // let userName = res.data.name;
      // console.log(userName);
      // let company = res.data.company;
      // console.log(company);
      // let location = res.data.location;
      // console.log(location);
      // let profile = res.data.html_url;
      // console.log(profile);
      // let blog = res.data.blog;
      // console.log(blog);
      // let bio = res.data.bio;
      // console.log(bio);
      // let repo = res.data.public_repos;
      // console.log(repo);
      // let followers = res.data.followers;
      // console.log(followers);
      // let stars = res.data.public_gists;
      // console.log(stars);
      // let following = res.data.following;
      // console.log(following);


    });
  
        
  });
};

function getStars(username){
  const starUrl = `https://api.github.com/users/${username}/repos?per_page=100`
  return axios.get(starUrl)
      .then(response => {
          return response.data.reduce((total, curr) => {
              total += curr.stargazers_count;
              return total
          }, 0)
          
      })
};

promptUser();

