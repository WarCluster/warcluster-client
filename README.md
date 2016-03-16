![warcluster logo](https://mir-s3-cdn-cf.behance.net/project_modules/disp/28168026279733.563586a13f4ae.gif)

WarCluster - Real-time Massive Multiplayer Online Space Strategy Arcade Browser Social Game for Twitter! ヘ(◕。◕ヘ)
===
:warning: This project's support is discontinued. Venture forth at your own peril. It's ~3 years old and we had no prior production experience with WebGL MMOs. It's considered as a playground although it's working (we held numerous tournaments with ~100 simultaneous real players and dozens small scale inhouse tests) ;)

Related links:

 - The Golang backend repo: https://github.com/vladimiroff/WarCluster
 - Amazingly strong AI player with fuzzy logic (written at 2 day hackathon) here: https://github.com/lepovica/WarCluster-AI  ლ(ಠ益ಠლ)
 - The awesome UI designer @Denitsa that also made the art of the game: https://www.behance.net/gallery/26279733/War-Cluster
 - The team behind this project: [humans.txt](https://github.com/vladimiroff/warcluster-site/blob/develop/public/humans.txt)

What can you expect to see in this ~3-year old repo:
- Some old [ThreeJS](http://threejs.org/)-Fu, a little GLSL magic for working with WebGL in the browser
- [WebSockets](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API) for some real-time mumbo-jumbo with the server (>'.')>=O____l_*__O=<('.'<)
- Some old [node-organic](http://node-organic.com/#/) approaches for the bundling pipeline of:
  - [BackboneJS](http://backbonejs.org/) for the ingame UI and the long-polling Leaderboard.
  - [LESS](http://lesscss.org/) for some juicy mixins 
  - [Jade-lang](http://jade-lang.com/) for some fancy markup 
  - [_.JS](http://underscorejs.org/) [¬º-°]¬
  - [TweenLite](https://github.com/greensock/GreenSock-JS) for some elegant animations
  - [bootstrap](getbootstrap.com) ¯\_(ツ)_/¯
  - [hammerjs](https://hammerjs.github.io/) for some mobile friendliness
... and some other extra spaghetti here and there :)

### History of how we got here

long story short: We wanted to learn something new ♪┏(・o･)┛♪┗ ( ･o･) ┓♪, experiment with the unthinkable & foresee the unimaginable. So we decided to make a web-fuckin-browser MMO as a side-project... It must had breathtaking tactics, large scale strategizing, thoughtful meta gameplay & dangerously social diplomacy. This is how WarCluster was born as the first social game for twitter! It was greatly inspired by [other games](https://hackpad.com/WarCluster-inspiration-1BvEVX758Ti)

#### [Setting](https://mir-s3-cdn-cf.behance.net/project_modules/1400/b2e9fc26279733.563593bb12d20.png)

It has 6 different races. Each race has it's own unique color. 
![six races](https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/0cbb1626279733.56353fde29024.png)

Each color corresponds to unique twitter #hashtag used for race wide communication (eg. #WarClusterRed). There're only verbal alliences between players.

#### Winning

The game is time based. Each round is approximately 10 days. The player with the *most controlled planets* (i.e. biggest empire) at the end of the round is proclaimed winner and therefore Galactic Emperor (here's one of the Beta winners [@valexiev](https://trello-attachments.s3.amazonaws.com/56e9cf6ad708c73bd6d0d26b/1352x623/0028f23f18dda84e9b5414f6c92e6c07/galactic_emperor.png))

#### Gameplay

Each player starts with a solar system consisting of 9 neutral planets. His home planet (the one with the asteroid belt) is impregnable. Typically each colonized planet has owner and generates for him army pilots per minute. The bigger the planet the more it generates.

At some point the army can grow bigger than the allowed population of the planet. So when the numbers get red bad things start to happen and army pilots are beginnig to die by the minute. Different sizes of planets have different population caps.
![planet info](https://trello-attachments.s3.amazonaws.com/56e9cf6ad708c73bd6d0d26b/789x435/d90a33aec2efcb3e2ceb7d62b3607faa/Screenshot-from-2015-04-19-17-17-41.png)![planet](https://trello-attachments.s3.amazonaws.com/56e9cf6ad708c73bd6d0d26b/556x418/e0134266d20b2618e5f56c3a09881c82/Screenshot-from-2015-04-19-17-14-04.png)

A player can send army pilots to *attack, spy or support* other planets depending on their verbal agreements with its owner. The spaceships travel slow so moves are carefully plotted. Imagine it as a real time game of [Go](https://en.wikipedia.org/wiki/Go_%28game%29)
![warcluster red armada](https://trello-attachments.s3.amazonaws.com/56e9cf6ad708c73bd6d0d26b/1221x604/91b0f6877364a81aa7368e2c1afbb7d3/WarClusterRed-armada.png):
 
 - Upon *attacking* a player conquers a planet if his attacking army is `> 1` than the other army. Everything is lost otherwise.
 - Upon *spying* a player gets the number of the army on the targeted planet. 
 - Upon *supporting* a player is donating his army to the planet's owner.

A player should spend extra effort to pick his enemies wiser and his allies patiently. Plot twists are around every hour.

There're different kind of ships indicating the size of the army. From left (smallest army, no more than 500 pilots) to right (biggest army, more than 6000 pilots). This is used to understand what's the expected army power that's approaching you.

![xs ships](https://trello-attachments.s3.amazonaws.com/56e9cf6ad708c73bd6d0d26b/182x164/81889186e2ec41c6cb423bf737e554e8/Screenshot-from-2015-04-19-18-22-34.png)![sm ships](https://trello-attachments.s3.amazonaws.com/56e9cf6ad708c73bd6d0d26b/212x180/c7c9a5a1fecd8b1adcbcb22cf4f5afa3/Screenshot-from-2015-04-19-18-23-40.png)![md ships](https://trello-attachments.s3.amazonaws.com/56e9cf6ad708c73bd6d0d26b/253x218/1a7fbb8f69c4a3c7b1a709dd92da83fa/Screenshot-from-2015-04-19-18-24-11.png)![lg ships](https://trello-attachments.s3.amazonaws.com/56e9cf6ad708c73bd6d0d26b/181x202/7f6b8001328c942ee54ecfa1741b0ae9/Screenshot-from-2015-04-19-18-24-46.png)![xxl ships](https://trello-attachments.s3.amazonaws.com/56e9cf6ad708c73bd6d0d26b/252x222/d6e47bf777cef2ebed607c53f78c005f/Screenshot-from-2015-04-19-18-34-12.png)

### Running the app
prerequisites:
- nodejs `~0.8` installed via nvm (https://github.com/creationix/nvm) or other suitable node package manager
- you need the [warcluster-server](https://github.com/vladimiroff/WarCluster) to be up & runnning ;)

After you have the prerequisites:
- `git clone ...`
- `npm install` // in the designated folder
- `node warcluster.js` // to run it in development mode

### Releasing to staging

1. Update the [twitter credentials](https://github.com/vladimiroff/warcluster-site/blob/develop/dna/plasma.json#L16-L17) with your consumer key/secret in order to have a social twitter login.
2. Point to your staging server [here](https://github.com/vladimiroff/warcluster-site/blob/develop/dna/cell.json#L5)
3. Run `scripts/release-staging.js` for automated release

#### Contributing:

Fork it and make required changes. After that push your changes in branch, which is named according to the changes you did. Initiate the PR (づ￣ ³￣)づ

