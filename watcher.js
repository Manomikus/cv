const { exec } = require('child_process');
const chokidar = require('chokidar');

// Fonction pour exécuter les commandes Git
const runGitCommands = () => {
  console.log('Changements détectés, ajout et commit...');
  exec('git add . && git commit -m "Auto-commit: Mise à jour automatique" && git push origin main', (err, stdout, stderr) => {
    if (err) {
      console.error(`Erreur lors de l'exécution des commandes Git : ${err.message}`);
      return;
    }
    console.log(`Résultat de Git : ${stdout}`);
    if (stderr) {
      console.error(`Erreur dans Git : ${stderr}`);
    }
  });
};

// Watcher pour surveiller les fichiers
const watcher = chokidar.watch('.', {
  ignored: /(^|[\/\\])\../, // Ignore les fichiers cachés comme .git, .DS_Store, etc.
  persistent: true
});

// Détection des changements
watcher.on('change', (path) => {
  console.log(`Fichier modifié : ${path}`);
  runGitCommands();
});

console.log('Watcher démarré...');
