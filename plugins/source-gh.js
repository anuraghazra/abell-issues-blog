const fs = require("fs");
const fetch = require("node-fetch");
const path = require("path");
const mkdirp = require("mkdirp");
const getDirName = require("path").dirname;

const beforeBuild = async () => {
  const user = "anuraghazra";
  const repo = "gatsby-github-issues-blog";
  const filterByLabelName = "blog";

  const REMOTE_API = `https://api.github.com/repos/${user}/${repo}/issues?access_token=${
    process.env.PERSONAL_TOKEN || ""
  }`;
  const githubIssuesRes = await fetch(REMOTE_API);
  const githubIssuesData = await githubIssuesRes.json();
  let issues = githubIssuesData;

  let filteredissue = issues.filter((i) => {
    if (
      !i.pull_request &&
      i.state === "open" &&
      i.labels.some((label) => label.name == filterByLabelName)
    ) {
      return true;
    }
    return false;
  });

  const createMeta = (issue) => {
    const { title, body, created_at } = issue;
    let p = path.join(process.cwd(), "content", issue.title, "meta.json");

    const meta = `\r
      {
        "title": "${title}",
        "description": "${body.replace(/\r?\n|\r/gm, "").slice(0, 100)}",
        "$createdAt": "${created_at}"
      }
    `;
    fs.writeFileSync(p, meta);
  };

  filteredissue.forEach((issue) => {
    let p = path.join(process.cwd(), "content", issue.title, "index.md");
    mkdirp.sync(getDirName(p));
    createMeta(issue);
    console.log(issue.body);
    fs.writeFileSync(p, issue.body);
  });
};

module.exports = { beforeBuild };
