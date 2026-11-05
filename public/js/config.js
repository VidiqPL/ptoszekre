// Media inherited from jaczup/ptoszek.pl and its contributors.
export const images = ['ptok.jpg','ptoszek.jpg','grubyptok.jpg','zimowyptoszek.jpeg','zlyptok.jpeg','kichajacyptoszek.jpg','lubieptoszki.png','ptakwspodniach.jpg','jaczup.jpg','jaczupme.png','ptokzjajami.jpeg','ptiszka.jpg','intro.gif'];
export const videos = ['duck.mp4','szybkakaczka.mp4','kaczuszka.mp4','golomb.mp4','rickroll.mp4','puddi.mp4','gratulacje.mp4','intro.mp4','jaczup.mp4','mushbox.mp4','clearmax.mp4','freestrona.mp4','ajhsdfhjasdbhfjasdfs.mp4','v09044g40000cgr968jc77u1t2krb89g.mov'];
export const messages = ['Ptasie radio nadaje.','Zptoszkowany!','Gołąb patrzy.','100% ptak.','Ptaszek przejął scenę.'];
export const pick = list => list[Math.floor(Math.random() * list.length)];

export const phrases = [
  'hello my name is ptoszek, lol',
  'birds are funny lalalalalalalallalala',
  'wgl co u cb bo u mn dbr',
  'knuuurrr eksplozja',
  'hee haw hee haw hee haw hee haw hee haw hee haw hee haw hee haw hee haw hee haw hee haw',
  'abcdefghijklmnopqrstuvwxyz abcdefghijklmnopqrstuvwxyz',
  'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaak',
  'eyo eyo eyo eyo eyo eyo eyo eyo eyo eyo eyo eyo eyo eyo eyo eyo eyo eyo eyo eyo eyo eyo eyo eyo'
];

// A shuffled bag gives each popup a random film without immediate repeats.
export function createVideoPicker(random = Math.random) {
  let bag = [], previous;
  return () => {
    if (!bag.length) {
      bag = [...videos];
      for (let i = bag.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [bag[i], bag[j]] = [bag[j], bag[i]];
      }
      if (bag.at(-1) === previous) [bag[0], bag[bag.length - 1]] = [bag.at(-1), bag[0]];
    }
    previous = bag.pop();
    return previous;
  };
}
