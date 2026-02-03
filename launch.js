#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const tools = [
  { name: '📊 DevTools Dashboard', command: 'open tools/devtools-dashboard/public/index.html', description: 'Graphical dashboard for skills and tools' },
  { name: '📰 News Aggregator', command: 'npm run news', description: 'Fetch and display trending news' },
  { name: '🧠 Skills List', command: 'npm run skills:list', description: 'List all available skills' },
  { name: '➕ Add Skill', command: 'npm run skills:add', description: 'Add a new skill to tracking system' },
  { name: '🔄 Sync Skills', command: 'npm run skills:sync', description: 'Sync skills between laptops' },
  { name: '❌ Exit', command: 'exit', description: 'Exit the launcher' }
];

function displayMenu() {
  console.clear();
  console.log('🚀 My Agent Configuration Launcher');
  console.log('===================================\n');
  
  tools.forEach((tool, index) => {
    console.log(`${index + 1}. ${tool.name}`);
    console.log(`   ${tool.description}\n`);
  });
  
  console.log('Select an option (1-6):');
}

function runCommand(command) {
  console.log(`\n🚀 Running: ${command}\n`);
  
  if (command === 'exit') {
    console.log('👋 Goodbye!');
    process.exit(0);
  }
  
  try {
    const child = spawn(command, [], { 
      shell: true, 
      stdio: 'inherit',
      env: { ...process.env, FORCE_COLOR: '1' }
    });
    
    child.on('close', (code) => {
      console.log(`\n✅ Command completed with code ${code}`);
      console.log('\nPress Enter to return to menu...');
      rl.question('', () => {
        displayMenu();
        askForChoice();
      });
    });
    
  } catch (error) {
    console.error(`❌ Error running command: ${error.message}`);
    console.log('\nPress Enter to return to menu...');
    rl.question('', () => {
      displayMenu();
      askForChoice();
    });
  }
}

function askForChoice() {
  rl.question('> ', (answer) => {
    const choice = parseInt(answer);
    
    if (isNaN(choice) || choice < 1 || choice > tools.length) {
      console.log(`❌ Please enter a number between 1 and ${tools.length}`);
      askForChoice();
      return;
    }
    
    const selectedTool = tools[choice - 1];
    
    if (selectedTool.command === 'npm run skills:add') {
      rl.question('Enter skill name: ', (skillName) => {
        runCommand(`./run.sh skills add "${skillName}"`);
      });
    } else {
      runCommand(selectedTool.command);
    }
  });
}

// Check if there are command line arguments
if (process.argv.length > 2) {
  const arg = process.argv[2];
  
  switch(arg) {
    case 'news':
      runCommand('npm run news');
      break;
    case 'skills:list':
      runCommand('npm run skills:list');
      break;
    case 'skills:add':
      if (process.argv[3]) {
        runCommand(`./run.sh skills add "${process.argv[3]}"`);
      } else {
        rl.question('Enter skill name: ', (skillName) => {
          runCommand(`./run.sh skills add "${skillName}"`);
        });
      }
      break;
    case 'skills:sync':
      runCommand('npm run skills:sync');
      break;
    default:
      console.log(`Unknown command: ${arg}`);
      console.log('Available commands: news, skills:list, skills:add, skills:sync');
      process.exit(1);
  }
} else {
  // Interactive mode
  displayMenu();
  askForChoice();
}