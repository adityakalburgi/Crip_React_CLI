#!/usr/bin/env node

import { program } from "commander";
import inquirer from "inquirer";
import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import ora from "ora";

console.log(chalk.cyan.bold(`
 ██████╗██████╗ ██╗██████╗     ██████╗ ███████╗ █████╗  ██████╗████████╗
██╔════╝██╔══██╗██║██╔══██╗    ██╔══██╗██╔════╝██╔══██╗██╔════╝╚══██╔══╝
██║     ██████╔╝██║██████╔╝    ██████╔╝█████╗  ███████║██║        ██║   
██║     ██╔══██╗██║██╔═══╝     ██╔══██╗██╔══╝  ██╔══██║██║        ██║   
╚██████╗██║  ██║██║██║         ██║  ██║███████╗██║  ██║╚██████╗   ██║   
 ╚═════╝╚═╝  ╚═╝╚═╝╚═╝         ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝ ╚═════╝   ╚═╝   
                            ██████╗██╗     ██╗
                           ██╔════╝██║     ██║
                           ██║     ██║     ██║
                           ██║     ██║     ██║
                           ╚██████╗███████╗██║
                            ╚═════╝╚══════╝╚═╝
`));
console.log(chalk.blue.bold('=================== React Project Generator with UI Templates ===================\n'));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const templatesDir = path.join(__dirname, "../templates");

async function createReactProject(projectName) {
  const spinner = ora(chalk.yellow('Preparing to create your awesome React project...')).start();
  await new Promise(resolve => setTimeout(resolve, 1000));
  spinner.succeed(chalk.green(`Project initialization started for: ${projectName}`));

  const { toolChoice } = await inquirer.prompt([
    {
      type: "list",
      name: "toolChoice",
      message: "Select your preferred React setup:",
      choices: [
        { name: chalk.cyan('⚛️  Create React App (Traditional Setup)'), value: "Create React App" },
        { name: chalk.magenta('⚡ Vite (Modern, Super Fast Setup)'), value: "Vite" }
      ],
    }
  ]);

  const setupSpinner = ora(chalk.yellow('Setting up your React project...')).start();
  const projectPath = path.join(process.cwd(), projectName);

  try {
    if (toolChoice === "Create React App") {
      execSync(`npx create-react-app ${projectName}`, { stdio: "inherit" });
    } else {
      execSync(`npm create vite@latest ${projectName} -- --template react`, { stdio: "inherit" });
      execSync(`cd ${projectName} && npm install`, { stdio: "inherit" });
    }
    setupSpinner.succeed(chalk.green('🎉 Project setup completed successfully!'));
  } catch (error) {
    setupSpinner.fail(chalk.red('Failed to create project'));
    console.error(error);
    process.exit(1);
  }

  await addTemplates(projectPath);
}

async function addTemplates(projectPath) {
  const availableTemplates = fs.readdirSync(templatesDir);
  if (availableTemplates.length === 0) {
    console.log(chalk.red("❌ No templates found!"));
    return;
  }

  const { selectedTemplates } = await inquirer.prompt([
    {
      type: "checkbox",
      name: "selectedTemplates",
      message: "Select templates to supercharge your project:",
      choices: availableTemplates.map(template => ({ name: chalk.cyan(`📁 ${template}`), value: template })),
    },
  ]);

  const templateSpinner = ora(chalk.yellow('Adding your selected templates...')).start();
  selectedTemplates.forEach((template) => {
    const srcTemplatePath = path.join(templatesDir, template);
    const destTemplatePath = path.join(projectPath, "src", template);
    fs.copySync(srcTemplatePath, destTemplatePath);
  });
  templateSpinner.succeed(chalk.green('🎨 Templates added successfully!'));

  console.log(chalk.bgCyan.black('\n🚀 All set! Here\'s what\'s next:\n'));
  console.log(chalk.yellow('1.'), chalk.white(`cd ${path.basename(projectPath)}`));
  console.log(chalk.yellow('2.'), chalk.white('npm start'));
  console.log(chalk.greenBright.bold('\nRemember to add Tailwind CSS to your project as the templates are Tailwind CSS based!'));
  console.log(chalk.cyan('\nHappy coding! 🎉\n'));

}

program.command("create <projectName>")
  .description("Create a new React project with templates")
  .action(createReactProject);

program.parse(process.argv);
