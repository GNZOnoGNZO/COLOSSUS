import { CardTemplate } from '../types/game';

// Card Collections
export const humanCards: CardTemplate[] = [
  {
    id: 'the-hero',
    name: 'The Hero', 
    year: '2023',
    types: ['human'],
    description: '..he knew we was destined for greater. It was only a matter of time..',
    effect: 'this card is in play for 2 rounds. negate any human card effects and cards allowing these effects for the duration of this card. deal an additional 2 damage for every nonhuman card in play per round.',
    duration: 2,
    cost: 7,
    onPlay: (game, player, opponent) => {
      game.addEffect({
        duration: 2,
        onRoundStart: () => {
          const nonhumanCount = game.getCardsInPlay().filter(c => c.types.includes('nonhuman')).length;
          opponent.takeDamage(2 * nonhumanCount);
        },
        negateEffects: (card) => card.types.includes('human')
      });
    }
  },
  {
    id: 'northern-queen',
    name: 'Northern Queen',
    year: '2023',
    types: ['human', 'nonhuman'],
    description: '...She rules with an iron fist, though her preferred method of torture involves gold.',
    effect: 'this card is in play for 1 round. multiply your currency effects by two for the duration of this card. if there is no more currency to take, deal the amount in damage to your opponent instead.',
    duration: 1, 
    cost: 9,
    onPlay: (game, player, opponent) => {
      game.addEffect({
        duration: 1,
        modifyCurrency: (amount) => {
          if (opponent.gold >= amount * 2) {
            return amount * 2;
          } else {
            opponent.takeDamage(amount * 2);
            return 0;
          }
        }
      });
    }
  },
  {
    id: 'annies-closet',
    name: 'Annie\'s Closet',
    year: '2023',
    types: ['human', 'nonhuman', 'unidentifiable'],
    description: '...people only thought she had 1 pyromancer bear...',
    effect: 'this card is in play for 3 rounds. only human card effects can be done during the duration of this card',
    duration: 3,
    cost: 7,
    onPlay: (game) => {
      game.addEffect({
        duration: 3,
        allowEffects: (card) => card.types.includes('human')
      });
    }
  },
  {
    id: 'yoshika-business',
    name: 'Yoshika Business',
    year: '2023', 
    types: ['human', 'unidentifiable', 'event'],
    description: '...we are allies... until we are not.',
    effect: 'this card is in play for 5 rounds. deal 2 damage at the start of every round to your opponent. you may borrow 20 gold from the bank in the first round, however, you will have to pay 30 gold back when sending this card to the crypt. if there is not enough gold to borrow, shuffle this card back into your deck. clearing this card early does not affect the debt time.',
    duration: 5,
    cost: 6,
    onPlay: (game, player, opponent) => {
      if (game.bank.gold >= 20) {
        player.gold += 20;
        game.bank.gold -= 20;
        game.addEffect({
          duration: 5,
          onRoundStart: () => opponent.takeDamage(2),
          onRemove: () => {
            if (player.gold >= 30) {
              player.gold -= 30;
              game.bank.gold += 30;
            } else {
              player.deck.shuffle(this);
            }
          }
        });
      } else {
        player.deck.shuffle(this);
      }
    }
  },
  {
    id: 'deal-maker',
    name: 'Deal Maker',
    year: '2023',
    types: ['human', 'nonhuman', 'celestial', 'unidentifiable', 'location', 'object'],
    description: 'The time is right.... Let\'s settle the score.',
    effect: 'this card is in play for 5 rounds. tally any amount healed, damage dealt, and gold obtained by your opponent for the first 4 rounds. deal double that amount in damage back to them at the start of the 5th round under one condition; you roll a 6 three times in a row on a 6 sided die. you only get one attempt. good luck.',
    duration: 5,
    cost: 15,
    onPlay: (game, player, opponent) => {
      let healingTally = 0;
      let damageTally = 0;
      let goldTally = 0;
      let currentRound = 0;
      
      game.addEffect({
        duration: 5,
        onRoundStart: () => {
          currentRound++;
          if (currentRound <= 4) {
            healingTally += opponent.healingThisRound;
            damageTally += opponent.damageDealtThisRound;
            goldTally += opponent.goldGainedThisRound;
          } else if (currentRound === 5) {
            const roll1 = game.rollDie(6);
            const roll2 = game.rollDie(6);
            const roll3 = game.rollDie(6);
            if (roll1 === 6 && roll2 === 6 && roll3 === 6) {
              const totalDamage = (healingTally + damageTally + goldTally) * 2;
              opponent.takeDamage(totalDamage);
            }
          }
        }
      });
    }
  },
  {
    id: 'advanced-caster',
    name: 'Advanced Caster',
    year: '2023',
    types: ['unidentifiable', 'human', 'nonhuman'],
    description: 'Revered as a master of the craft, this caster burns fear into those opposing him.',
    effect: 'this card is in play for 3 rounds. remove 3 cards from your opponent\'s hand the first round, pick up 3 extra cards at the start of the second round, and remove 3 from their hand in the third round.',
    duration: 3,
    cost: 12,
    onPlay: (game, player, opponent) => {
      let currentRound = 0;
      game.addEffect({
        duration: 3,
        onRoundStart: () => {
          currentRound++;
          if (currentRound === 1) {
            for (let i = 0; i < 3; i++) {
              if (opponent.hand.length > 0) {
                opponent.hand.removeRandom().sendToCrypt();
              }
            }
          } else if (currentRound === 2) {
            for (let i = 0; i < 3; i++) {
              player.drawCard();
            }
          } else if (currentRound === 3) {
            for (let i = 0; i < 3; i++) {
              if (opponent.hand.length > 0) {
                opponent.hand.removeRandom().sendToCrypt();
              }
            }
          }
        }
      });
    }
  },
  {
    id: 'the-champ',
    name: 'The Champ',
    year: '2023',
    types: ['human', 'unidentifiable'],
    description: 'He has studied every art of fighting and war, and is one of the most feared fighters imaginable!',
    effect: 'this card is in play for 1 round. give your opponent a chosen amount of gold, dealing 1 damage per 1 gold given, (maximum of 20 gold)',
    duration: 1,
    cost: 0,
    onPlay: (game, player, opponent) => {
      game.addEffect({
        duration: 1,
        onRoundStart: () => {
          const goldToGive = Math.min(20, player.gold);
          if (goldToGive > 0) {
            player.gold -= goldToGive;
            opponent.gold += goldToGive;
            opponent.takeDamage(goldToGive);
          }
        }
      });
    }
  },
  {
    id: 'intermediate-caster',
    name: 'Intermediate Caster',
    year: '2023',
    types: ['unidentifiable', 'human', 'nonhuman'],
    description: 'Legend has it, she annihilated the entire student body during graduation.... one of the most revered and feared!',
    effect: 'this card is in play for 3 rounds. For the first two rounds, block and tally any damage towards you. In the 3rd round, deal half of the total damage back to your opponent, and heal for the other half amount. if it\'s an odd total, choose where to place the remaining number.',
    duration: 3,
    cost: 5,
    onPlay: (game, player, opponent) => {
      let damageTally = 0;
      let currentRound = 0;
      game.addEffect({
        duration: 3,
        onDamageReceived: (damage) => {
          if (currentRound < 2) {
            damageTally += damage;
            return 0;
          }
          return damage;
        },
        onRoundStart: () => {
          currentRound++;
          if (currentRound === 3) {
            const halfDamage = Math.floor(damageTally / 2);
            const remainingDamage = damageTally % 2;
            opponent.takeDamage(halfDamage + remainingDamage);
            player.heal(halfDamage);
          }
        }
      });
    }
  },
  {
    id: 'absorb',
    name: 'Absorb',
    year: '2023',
    types: ['human', 'nonhuman', 'event'],
    description: 'An incredibly advanced spell... only for the desperate.',
    effect: 'draw one card after playing this card, and send your hand to the crypt to gain 10 health',
    duration: 0,
    cost: 8,
    onPlay: (game, player) => {
      player.drawCard();
      while (player.hand.length > 0) {
        player.hand.removeRandom().sendToCrypt();
      }
      player.heal(10);
    }
  },
  {
    id: 'melopix-bank-heist',
    name: 'Melopix Bank Heist',
    year: '2023',
    types: ['human', 'nonhuman', 'event'],
    description: 'this ain\'t a scene.... hands up!',
    effect: 'roll a six sided die. multiply that number by 2 and take that amount of gold from the bank. if there is 0 gold, shuffle this card back into your deck. this card can only be played twice per game.',
    duration: 0,
    cost: 5,
    timesPlayed: 0,
    onPlay: (game, player) => {
      if (this.timesPlayed >= 2) {
        return;
      }
      const roll = game.rollDie(6);
      const goldToTake = roll * 2;
      if (game.bank.gold >= goldToTake) {
        game.bank.gold -= goldToTake;
        player.gold += goldToTake;
        this.timesPlayed++;
      } else {
        player.deck.shuffle(this);
      }
    }
  },
  {
    id: 'king-kain',
    name: 'King Kain',
    year: '2023',
    types: ['human', 'celestial'],
    description: 'He rallies together even the saddest and lost of souls. His words drive pride and power through his people.',
    effect: 'play this card at the beginning of a round. the next card played will deal 5 additional damage if it is a human or nonhuman card',
    duration: 0,
    cost: 6,
    onPlay: (game) => {
      game.addEffect({
        duration: 1,
        onCardPlayed: (card) => {
          if (card.types.includes('human') || card.types.includes('nonhuman')) {
            game.addEffect({
              duration: 1,
              onDamageDealt: (damage) => damage + 5
            });
          }
        }
      });
    }
  },
  {
    id: 'failing-operation',
    name: 'Failing Operation',
    year: '2023',
    types: ['human', 'event', 'unidentifiable'],
    description: 'mayday, mayday! We\'re falling out over the side here!\n..how is Agent J doing?\n..Agent J...?!',
    effect: 'you and your opponent roll a 6 sided die. If the amounts both add up to 8 or more, you take 8 gold. If they do not, they take 4 gold',
    duration: 0,
    cost: 3,
    onPlay: (game, player, opponent) => {
      const playerRoll = game.rollDie(6);
      const opponentRoll = game.rollDie(6);
      if (playerRoll + opponentRoll >= 8) {
        if (game.bank.gold >= 8) {
          game.bank.gold -= 8;
          player.gold += 8;
        }
      } else {
        if (game.bank.gold >= 4) {
          game.bank.gold -= 4;
          opponent.gold += 4;
        }
      }
    }
  },
  {
    id: 'shiri-o',
    name: 'Shiri-ø',
    year: '2023',
    types: ['human', 'nonhuman'],
    description: '....the oldest cult leader to have ever existed.. they say he mastered the art of blood through mass executions..',
    effect: 'this card is in play for 1 round. take any human card, regardless of game status, and place it on the top of your deck',
    duration: 1,
    cost: 5,
    onPlay: (game, player) => {
      const allHumanCards = [...player.deck.cards, ...player.crypt.cards].filter(card => 
        card.types.includes('human')
      );
      if (allHumanCards.length > 0) {
        const selectedCard = allHumanCards[0];
        selectedCard.removeFromCurrentLocation();
        player.deck.addToTop(selectedCard);
      }
    }
  },
  {
    id: 'just-a-little-bit',
    name: 'just a little bit...',
    year: '2023',
    types: ['human', 'unidentifiable'],
    description: 'The unfortunate demise of a particular subject;\nOne found it necessary to use the Click remote to rewind their way out of a parking ticket.\n~\nHowever, rewinding "just a little bit" cost him his reality.',
    effect: 'this card is in play for 2 rounds. any human creatures in the next 2 rounds that are put into play are negated',
    duration: 2,
    cost: 3,
    onPlay: (game) => {
      game.addEffect({
        duration: 2,
        onCardPlayed: (card) => {
          if (card.types.includes('human')) {
            return false;
          }
          return true;
        }
      });
    }
  }
];

export const celestialCards: CardTemplate[] = [
  {
    id: 'table-of-sacrifice',
    name: 'Table Of Sacrifice',
    year: '2023',
    types: ['nonhuman', 'celestial'],
    description: 'Hidden deep within the cavernous mountains.... lies a table used for centuries.',
    effect: 'this card is in play for 3 rounds. heal 4 health per round, but reduce the damage you do by 3. this card can be played over "Goblet Of Life" at any point in time, removing the previous card\'s effect and replacing it.',
    duration: 3,
    cost: 9,
    onPlay: (game, player) => {
      game.removeEffect('goblet-of-life');
      game.addEffect({
        id: 'table-of-sacrifice',
        duration: 3,
        onRoundStart: () => {
          player.heal(4);
        },
        onDamageDealt: (damage) => Math.max(0, damage - 3)
      });
    }
  },
  {
    id: 'jacobs-second-ladder',
    name: 'Jacob\'s Second Ladder',
    year: '2023',
    types: ['nonhuman', 'celestial'],
    description: 'instead of death, the universe gifts the very fortunate with a path to the light...',
    effect: 'this card is in play for 3 rounds. tally up the amount of celestial cards played during its duration & remove that amount from the gold needed to summon your next celestial.',
    duration: 3,
    cost: 10,
    onPlay: (game, player) => {
      let celestialCount = 0;
      game.addEffect({
        duration: 3,
        onCardPlayed: (card) => {
          if (card.types.includes('celestial')) {
            celestialCount++;
          }
        },
        onRemove: () => {
          game.addEffect({
            duration: 1,
            onCardCost: (card, cost) => {
              if (card.types.includes('celestial')) {
                return Math.max(0, cost - celestialCount);
              }
              return cost;
            }
          });
        }
      });
    }
  },
  {
    id: 'kiiad-the-confuser',
    name: 'K\'iiad, The Confuser',
    year: '2023',
    types: ['celestial', 'unidentifiable', 'event'],
    description: '...he speaks from the beyond. They warn not to answer his call...',
    effect: 'this card is in play for 3 rounds. negate any damage done to you in the first round. replace this card with the last celestial sent to the crypt and reset its duration in the third round.',
    duration: 3,
    cost: 9,
    onPlay: (game, player) => {
      let currentRound = 0;
      game.addEffect({
        duration: 3,
        onRoundStart: () => {
          currentRound++;
          if (currentRound === 1) {
            game.addEffect({
              duration: 1,
              onDamageReceived: () => 0
            });
          } else if (currentRound === 3) {
            const lastCelestial = player.crypt.cards.reverse().find(card => 
              card.types.includes('celestial')
            );
            if (lastCelestial) {
              lastCelestial.removeFromCurrentLocation();
              lastCelestial.duration = lastCelestial.originalDuration;
              player.playCard(lastCelestial);
            }
          }
        }
      });
    }
  },
  {
    id: 'nyuu-the-bestower',
    name: 'Nyuu\', The Bestower',
    year: '2023',
    types: ['celestial', 'unidentifiable', 'event'],
    description: 'From the cosmos, he winds the threads of fate into his intricate web...',
    effect: 'this card is in play for 3 rounds. tally up the amount of celestials played during this card\'s duration. extend the duration of one chosen celestial card by that amount when sending this card to the crypt.',
    duration: 3,
    cost: 9,
    onPlay: (game, player) => {
      let celestialsPlayed = 0;
      game.addEffect({
        duration: 3,
        onCardPlayed: (card) => {
          if (card.types.includes('celestial')) {
            celestialsPlayed++;
          }
        },
        onRemove: () => {
          const celestialCards = game.getCardsInPlay().filter(c => c.types.includes('celestial'));
          if (celestialCards.length > 0) {
            const chosenCard = game.chooseCard(celestialCards);
            chosenCard.duration += celestialsPlayed;
          }
        }
      });
    }
  },
  {
    id: 'mirror-of-avagoss',
    name: 'Mirror Of Ava\'goss',
    year: '2023',
    types: ['nonhuman', 'celestial', 'unidentifiable'],
    description: '...no one knows where it leads.. and some spend their entire lives looking for it.',
    effect: 'this card is in play for 4 rounds. repeat all health and currency related actions done in the first 2 rounds again for the final 2 rounds.',
    duration: 4,
    cost: 13,
    onPlay: (game, player, opponent) => {
      let actions = [];
      let currentRound = 0;
      
      game.addEffect({
        duration: 4,
        onRoundStart: () => {
          currentRound++;
          if (currentRound <= 2) {
            actions.push({
              healing: player.healingThisRound,
              damage: player.damageDealtThisRound,
              goldGained: player.goldGainedThisRound,
              goldLost: player.goldLostThisRound
            });
          } else if (currentRound > 2) {
            const pastAction = actions[currentRound - 3];
            if (pastAction) {
              if (pastAction.healing > 0) player.heal(pastAction.healing);
              if (pastAction.damage > 0) opponent.takeDamage(pastAction.damage);
              if (pastAction.goldGained > 0) player.gold += pastAction.goldGained;
              if (pastAction.goldLost > 0) player.gold -= pastAction.goldLost;
            }
          }
        }
      });
    }
  },
  {
    id: 'ollgrw',
    name: 'Oll\'grw',
    year: '2023',
    types: ['celestial', 'unidentifiable'],
    description: 'A nihilistic celestial that is pleasing to look at; it is cursed to wander for all eternity..',
    effect: 'this card is in play for 3 rounds. you and your opponent must shuffle their hand into their deck in the first round. send two cards from you and your opponent\'s hand to the crypt in the third round.',
    duration: 3,
    cost: 8,
    onPlay: (game, player, opponent) => {
      let currentRound = 0;
      game.addEffect({
        duration: 3,
        onRoundStart: () => {
          currentRound++;
          if (currentRound === 1) {
            player.shuffleHandIntoDeck();
            opponent.shuffleHandIntoDeck();
          } else if (currentRound === 3) {
            for (let i = 0; i < 2; i++) {
              if (player.hand.length > 0) {
                player.hand.removeRandom().sendToCrypt();
              }
              if (opponent.hand.length > 0) {
                opponent.hand.removeRandom().sendToCrypt();
              }
            }
          }
        }
      });
    }
  },
  {
    id: 'ythpxx',
    name: 'Yth\'pxx',
    year: '2023',
    types: ['celestial', 'unidentifiable'],
    description: 'A boisterous celestial that sails through the cosmos creating colors and bending reality...',
    effect: 'this card is in play for 3 rounds. draw one extra card at the start of each round during this card\'s duration',
    duration: 3,
    cost: 8,
    onPlay: (game, player) => {
      game.addEffect({
        duration: 3,
        onRoundStart: () => {
          player.drawCard();
        }
      });
    }
  },
  {
    id: 'ythuu-the-destruction',
    name: 'Ythuu\', the Destruction',
    year: '2023',
    types: ['celestial'],
    description: 'Legend has it, it came down and wreaked havoc from the heavens..\nAnd then all of a sudden... it vanished!',
    effect: 'this card is in play for 3 rounds. each round; deal 3 damage to your opponent, send 1 card from their hand to the crypt, and remove 2 gold from your opponent.',
    duration: 3,
    cost: 10,
    onPlay: (game, player, opponent) => {
      game.addEffect({
        duration: 3,
        onRoundStart: () => {
          opponent.takeDamage(3);
          if (opponent.hand.length > 0) {
            opponent.hand.removeRandom().sendToCrypt();
          }
          opponent.gold = Math.max(0, opponent.gold - 2);
        }
      });
    }
  },
  {
    id: 'yaya-goddess',
    name: 'Yaya, Goddess of Emanation',
    year: '2023',
    types: ['celestial'],
    description: '....reclusive and historically omniscient... \nshe picks her targets without mercy.',
    effect: 'this card is in play for 2 rounds. deal 2 damage per celestial in play and 3 damage per human card in play per round during its duration. deal 10 damage to your opponent if this card is cleared.',
    duration: 2,
    cost: 8,
    onPlay: (game, player, opponent) => {
      game.addEffect({
        duration: 2,
        onRoundStart: () => {
          const celestialCount = game.getCardsInPlay().filter(c => c.types.includes('celestial')).length;
          const humanCount = game.getCardsInPlay().filter(c => c.types.includes('human')).length;
          opponent.takeDamage(celestialCount * 2 + humanCount * 3);
        },
        onRemove: () => {
          opponent.takeDamage(10);
        }
      });
    }
  },
  {
    id: 'hylia-the-valiant',
    name: 'Hylia, the Valiant',
    year: '2023',
    types: ['nonhuman', 'celestial'],
    description: 'He hides in the shadows, pondering his next meal...',
    effect: 'this card is in play for 4 rounds. reduce the damage your opponent does by 5 in the 1st and 3rd round. take the total damage the opponent dealt to you in the 2nd round and deal that back to your opponent when sending this card to the crypt.',
    duration: 4,
    cost: 9,
    onPlay: (game, player, opponent) => {
      let currentRound = 0;
      let damageInSecondRound = 0;
      game.addEffect({
        duration: 4,
        onRoundStart: () => {
          currentRound++;
          if (currentRound === 2) {
            damageInSecondRound = opponent.damageDealtThisRound;
          }
        },
        onDamageReceived: (damage) => {
          if (currentRound === 1 || currentRound === 3) {
            return Math.max(0, damage - 5);
          }
          return damage;
        },
        onRemove: () => {
          opponent.takeDamage(damageInSecondRound);
        }
      });
    }
  },
  {
    id: 'converging-paralax',
    name: 'Converging Paralax',
    year: '2023',
    types: ['celestial', 'event'],
    description: 'There is a bond between celestials that is unknown to others... they are all connected...',
    effect: 'if this card is in your hand at the start of a turn, you can draw one card before playing. send any celestials to the crypt, combining their summoning gold and dealing that amount in damage to your opponent',
    duration: 0,
    cost: 10,
    onPlay: (game, player, opponent) => {
      player.drawCard();
      const celestials = game.getCardsInPlay().filter(c => c.types.includes('celestial'));
      let totalCost = 0;
      celestials.forEach(card => {
        totalCost += card.cost;
        card.sendToCrypt();
      });
      opponent.takeDamage(totalCost);
    }
  },
  {
    id: 'rebirth',
    name: 'Rebirth',
    year: '2023',
    types: ['celestial', 'event'],
    description: 'In a flash, blinding...\nThey came from the beyond!',
    effect: 'play this card second. place 1 celestial card from the crypt back into your hand. if there are none, gain 7 health. remove this card from play',
    duration: 0,
    cost: 6,
    onPlay: (game, player) => {
      const celestialFromCrypt = player.crypt.cards.find(card => card.types.includes('celestial'));
      if (celestialFromCrypt) {
        celestialFromCrypt.removeFromCurrentLocation();
        player.hand.add(celestialFromCrypt);
      } else {
        player.heal(7);
      }
    }
  },
  {
    id: 'face-of-fate',
    name: 'Face of Fate',
    year: '2023',
    types: ['celestial', 'unidentifiable'],
    description: 'The face you feel watching you from the shadows. It watches the moments you appreciate.. and the ones you throw away.',
    effect: 'this card is in play for 3 rounds. if you have more gold than your opponent in the beginning of the 3rd round, deal 5 damage to your opponent',
    duration: 3,
    cost: 2,
    onPlay: (game, player, opponent) => {
      let currentRound = 0;
      game.addEffect({
        duration: 3,
        onRoundStart: () => {
          currentRound++;
          if (currentRound === 3 && player.gold > opponent.gold) {
            opponent.takeDamage(5);
          }
        }
      });
    }
  },
  {
    id: 'helonius-text',
    name: 'Helonius Text',
    year: '2023',
    types: ['celestial', 'object'],
    description: 'Once awakened, the book creates whatever is written into reality.\n~\nNobody has ever seen what it creates, or has lived to read its pages.',
    effect: 'this card is in play for 2 rounds. duplicate any object played during its duration and mimic its duration',
    duration: 2,
    cost: 5,
    onPlay: (game, player) => {
      game.addEffect({
        duration: 2,
        onCardPlayed: (card) => {
          if (card.types.includes('object')) {
            const duplicate = { ...card };
            player.playCard(duplicate);
          }
        }
      });
    }
  },
  {
    id: 'oio',
    name: 'ŒIO',
    year: '2023',
    types: ['celestial'],
    description: 'Those brave enough to time travel always run the risk of the butterfly effect.\nTo mess up the fabric of time will forever mean an inevitable end.\nIt comes for you.\nAnd there is nothing you can do.',
    effect: 'remove your opponent\'s newest creature from play and remove this creature from play',
    duration: 0,
    cost: 5,
    onPlay: (game, player, opponent) => {
      const newestCreature = opponent.getCardsInPlay().reverse().find(card => 
        !card.types.includes('event') && !card.types.includes('object')
      );
      if (newestCreature) {
        newestCreature.removeFromPlay();
      }
      this.removeFromPlay();
    }
  },
  {
    id: 'aeon',
    name: 'ÆON',
    year: '2023',
    types: ['celestial'],
    description: 'As a result of the butterfly affect, the folklore entity makes itself known.\n~\nThe winder of sand, and bringer of color;\nit writes the wrongs of those found meddling through time.',
    effect: 'negate the events of the entire last round',
    duration: 0,
    cost: 6,
    onPlay: (game) => {
      game.undoLastRound();
    }
  }
];

export const eventCards: CardTemplate[] = [
  {
    id: 'vaporize',
    name: 'Vaporize',
    year: '2024',
    types: ['event'],
    description: 'skin.. flesh.. bone.. and possibly soul; all gone.',
    effect: 'this card is in play for 3 rounds. each round, choose one card in play and remove it from play for the rest of the game, including any effects. this does not prevent said cards from reentering the game.',
    duration: 3,
    cost: 10,
    onPlay: (game) => {
      let currentRound = 0;
      game.addEffect({
        duration: 3,
        onRoundStart: () => {
          currentRound++;
          const cardsInPlay = game.getCardsInPlay();
          if (cardsInPlay.length > 0) {
            const chosenCard = game.chooseCard(cardsInPlay);
            chosenCard.removeFromPlay();
          }
        }
      });
    }
  },
  {
    id: 'catastrophe',
    name: 'Catastrophe',
    year: '2023',
    types: ['event', 'nonhuman'],
    description: 'One for the history books... what have we done...?',
    effect: 'this card is in play for 10 rounds. you and your opponent must discard the top card of your deck to the crypt before drawing to your hand. on the final round; shuffle your hand, crypt, and deck together, and you both take 1 gold from the bank. if there is 0 gold in the bank afterwards, you both lose 20 health.',
    duration: 10,
    cost: 6,
    onPlay: (game, player, opponent) => {
      let currentRound = 0;
      game.addEffect({
        duration: 10,
        onRoundStart: () => {
          currentRound++;
          if (currentRound < 10) {
            if (player.deck.length > 0) {
              player.deck.drawCard().sendToCrypt();
            }
            if (opponent.deck.length > 0) {
              opponent.deck.drawCard().sendToCrypt();
            }
          } else {
            // Final round
            player.shuffleAll();
            opponent.shuffleAll();
            
            if (game.bank.gold >= 2) {
              game.bank.gold -= 2;
              player.gold += 1;
              opponent.gold += 1;
            } else {
              player.takeDamage(20);
              opponent.takeDamage(20);
            }
          }
        }
      });
    }
  },
  {
    id: 'goblet-of-life',
    name: 'Goblet Of Life',
    year: '2023',
    types: ['event', 'nonhuman'],
    description: 'A seemingly innocent Valencia Chalice that invokes a certain mood...',
    effect: 'this card is in play for 3 rounds. heal 3 health per round, but reduce the damage you do by 2. this card can be played over "Cup Of Blood" at any point in time, removing the previous card\'s effect and replacing it.',
    duration: 3,
    cost: 7,
    onPlay: (game, player) => {
      // Remove Cup of Blood if present
      const cupOfBlood = game.getCardsInPlay().find(card => card.id === 'cup-of-blood');
      if (cupOfBlood) {
        cupOfBlood.removeFromPlay();
      }

      game.addEffect({
        duration: 3,
        onRoundStart: () => {
          player.heal(3);
        },
        onDamageDealt: (damage) => {
          return Math.max(0, damage - 2);
        }
      });
    }
  },
  {
    id: 'cup-of-blood',
    name: 'Cup Of Blood',
    year: '2023',
    types: ['object', 'nonhuman'],
    description: 'A vision came to the blacksmith... to forge a cup, instead of a sword...',
    effect: 'this card is in play for 4 rounds. heal 2 health per round, but reduce the damage you do by 1. heal 4 health if cleared by the opponent.',
    duration: 4,
    cost: 5,
    onPlay: (game, player) => {
      game.addEffect({
        duration: 4,
        onRoundStart: () => {
          player.heal(2);
        },
        onDamageDealt: (damage) => {
          return Math.max(0, damage - 1);
        },
        onClearedByOpponent: () => {
          player.heal(4);
        }
      });
    }
  },
  {
    id: 'wall-of-flesh',
    name: 'Wall of Flesh',
    year: '2023',
    types: ['event'],
    description: 'It whispers thousands of languages all at once... in hopes of attracting followers...',
    effect: 'this card is in play for 3 rounds. heal 3 health per 2 damage dealt to you at the end of each round during this card\'s duration. if this card is cleared, deal 8 damage and heal 10 health.',
    duration: 3,
    cost: 9,
    onPlay: (game, player, opponent) => {
      let damageTaken = 0;
      game.addEffect({
        duration: 3,
        onDamageReceived: (damage) => {
          damageTaken += damage;
          return damage;
        },
        onRoundEnd: () => {
          const healing = Math.floor(damageTaken / 2) * 3;
          player.heal(healing);
          damageTaken = 0;
        },
        onClearedByOpponent: () => {
          opponent.takeDamage(8);
          player.heal(10);
        }
      });
    }
  },
  {
    id: 'aquilus-rift',
    name: 'Aquilus\' Rift',
    year: '2023',
    types: ['event'],
    description: 'No... do not read from it\'s pages!',
    effect: 'this card is in play for 1 round. take any one card from your deck and put it directly into play.',
    duration: 1,
    cost: 5,
    onPlay: (game, player) => {
      const chosenCard = game.chooseCard(player.deck.cards);
      if (chosenCard) {
        chosenCard.removeFromCurrentLocation();
        player.playCard(chosenCard);
      }
    }
  },
  {
    id: 'dreamstate',
    name: 'Dreamstate',
    year: '2023',
    types: ['event'],
    description: 'well, what an odd request...',
    effect: 'this card is in play for 4 rounds. tally the total amount of unidentifiable cards during this card\'s duration and take half of that amount in gold from your opponent, healing for the other half when sending this card to the crypt.',
    duration: 4,
    cost: 9,
    onPlay: (game, player, opponent) => {
      let unidentifiableCount = 0;
      game.addEffect({
        duration: 4,
        onCardPlayed: (card) => {
          if (card.types.includes('unidentifiable')) {
            unidentifiableCount++;
          }
        },
        onRemove: () => {
          const halfAmount = Math.floor(unidentifiableCount / 2);
          const goldToTake = Math.min(opponent.gold, halfAmount);
          opponent.gold -= goldToTake;
          player.gold += goldToTake;
          player.heal(halfAmount);
        }
      });
    }
  },
  {
    id: 'crypt-reaver',
    name: 'Crypt Reaver',
    year: '2023',
    types: ['nonhuman', 'unidentifiable', 'event'],
    description: 'The Crypt is his realm..\nThe creatures; his puppets.',
    effect: 'this card is in play for 3 rounds. each round, choose to do any 1 of the following; draw 3 cards at the start of a round from the crypt, send 3 cards from your opponent\'s hand to the crypt, or send 3 cards from your crypt back onto the top of your deck.',
    duration: 3,
    cost: 13,
    onPlay: (game, player, opponent) => {
      let currentRound = 0;
      game.addEffect({
        duration: 3,
        onRoundStart: () => {
          currentRound++;
          const choices = [
            'Draw 3 from crypt',
            'Send 3 from opponent hand to crypt',
            'Send 3 from crypt to deck'
          ];
          const choice = game.chooseOption(choices);
          
          switch(choice) {
            case 0:
              for (let i = 0; i < 3; i++) {
                if (player.crypt.length > 0) {
                  const card = player.crypt.drawRandom();
                  player.hand.add(card);
                }
              }
              break;
            case 1:
              for (let i = 0; i < 3; i++) {
                if (opponent.hand.length > 0) {
                  opponent.hand.removeRandom().sendToCrypt();
                }
              }
              break;
            case 2:
              for (let i = 0; i < 3; i++) {
                if (player.crypt.length > 0) {
                  const card = player.crypt.drawRandom();
                  player.deck.addToTop(card);
                }
              }
              break;
          }
        }
      });
    }
  },
  {
    id: 'second-shipment',
    name: 'Second Shipment',
    year: '2023',
    types: ['unidentifiable', 'event'],
    description: 'What do you mean it was \'just here\'..? ....Where is it?!',
    effect: 'this card is in play for 3 rounds. remove any and all items from your opponent\'s side from play. any item played during its duration will be removed from play.',
    duration: 3,
    cost: 6,
    onPlay: (game, player, opponent) => {
      // Remove existing items
      opponent.getCardsInPlay().forEach(card => {
        if (card.types.includes('object')) {
          card.removeFromPlay();
        }
      });

      game.addEffect({
        duration: 3,
        onCardPlayed: (card) => {
          if (card.owner === opponent && card.types.includes('object')) {
            card.removeFromPlay();
          }
        }
      });
    }
  },
  {
    id: 'atmos',
    name: 'Atmos',
    year: '2023',
    types: ['event', 'unidentifiable'],
    description: 'One cannot just call upon the divine for assistance....',
    effect: 'this card is in play for 4 rounds. deal 1 damage in the first round, doubling it every round during its duration (8 damage at round 4)',
    duration: 4,
    cost: 8,
    onPlay: (game, player, opponent) => {
      let currentRound = 0;
      let damage = 1;
      game.addEffect({
        duration: 4,
        onRoundStart: () => {
          currentRound++;
          opponent.takeDamage(damage);
          damage *= 2;
        }
      });
    }
  },
  {
    id: 'creature-control',
    name: 'Creature Control',
    year: '2023',
    types: ['event', 'unidentifiable'],
    description: '...only the most advanced caster can control any creature using wits and soul stones...!',
    effect: 'this card is in play for 3 rounds. deposit 4 gold into the bank to remove 1 human or nonhuman card from your opponent\'s side (hand or field), at a maximum of 12 gold.',
    duration: 3,
    cost: 2,
    onPlay: (game, player, opponent) => {
      let goldSpent = 0;
      game.addEffect({
        duration: 3,
        onRoundStart: () => {
          while (goldSpent < 12 && player.gold >= 4) {
            const shouldContinue = game.askYesNo('Spend 4 gold to remove a creature?');
            if (!shouldContinue) break;

            const targets = [
              ...opponent.getCardsInPlay().filter(card => 
                card.types.includes('human') || card.types.includes('nonhuman')
              ),
              ...opponent.hand.cards.filter(card =>
                card.types.includes('human') || card.types.includes('nonhuman')
              )
            ];

            if (targets.length > 0) {
              const target = game.chooseCard(targets);
              if (target) {
                player.gold -= 4;
                game.bank.gold += 4;
                goldSpent += 4;
                target.removeFromCurrentLocation();
                target.sendToCrypt();
              }
            }
          }
        }
      });
    }
  },
  {
    id: 'baezers-bazaar',
    name: 'Bæzer\'s Bazaar',
    year: '2023',
    types: ['event', 'unidentifiable'],
    description: '...Come one and all! We have anything you can imagine...!',
    effect: 'this card is in play for 2 rounds. Increase all gold related card\'s effects and gold costs by 3 additional gold.',
    duration: 2,
    cost: 5,
    onPlay: (game) => {
      game.addEffect({
        duration: 2,
        onGoldEffect: (amount) => amount + 3,
        onCardCost: (card, cost) => cost + 3
      });
    }
  },
  {
    id: 'comical-intervention',
    name: 'Comical Intervention',
    year: '2023',
    types: ['event', 'unidentifiable'],
    description: 'An effective strategy used by the ancients...',
    effect: 'this card is in play for 2 rounds. swap gold effects into health, and vice versa for the duration of this card for both you and your opponent. Reduce all effects by 4 during the duration of this card',
    duration: 2,
    cost: 7,
    onPlay: (game) => {
      game.addEffect({
        duration: 2,
        onGoldEffect: (amount) => {
          const health = Math.max(0, amount - 4);
          game.currentPlayer.heal(health);
          return 0;
        },
        onHealingEffect: (amount) => {
          const gold = Math.max(0, amount - 4);
          game.currentPlayer.gold += gold;
          return 0;
        }
      });
    }
  },
  {
    id: 'universal-tax',
    name: 'Universal Tax',
    year: '2023',
    types: ['unidentifiable'],
    description: 'Only two things in this life of that I\'m sure...',
    effect: 'play this card, and then remove it from play. each player must pay 3 gold to the bank. it is required that each player has 3 of these cards in their deck.',
    duration: 0,
    cost: 0,
    onPlay: (game, player, opponent) => {
      player.gold = Math.max(0, player.gold - 3);
      opponent.gold = Math.max(0, opponent.gold - 3);
      game.bank.gold += 6;
    }
  },
  {
    id: 'deja-man',
    name: 'Déjà Man',
    year: '2023',
    types: ['nonhuman', 'unidentifiable', 'event'],
    description: 'I\'ve seen him before.... haven\'t I?',
    effect: 'play this card, and then remove from play. if you or your opponent play this card again, the card\'s opponent receives 10 damage. this card cannot be played twice within the same turn. this effect cannot be cleared or stacked.',
    duration: 0,
    cost: 4,
    timesPlayedThisTurn: 0,
    onPlay: (game, player, opponent) => {
      if (this.timesPlayedThisTurn > 0) {
        opponent.takeDamage(10);
      }
      this.timesPlayedThisTurn++;
      game.onTurnEnd(() => {
        this.timesPlayedThisTurn = 0;
      });
    }
  },
  {
    id: 'la-santa-miguela',
    name: 'La Santa Miguela',
    year: '2023',
    types: ['event', 'unidentifiable'],
    description: 'The church built in the name of St. GONZO.\nIt was quickly abandoned as many lost faith... yet the power it contained grew.',
    effect: 'this card is in play for 2 rounds. remove any card play prevention affects during the duration. send any/all of these prevention cards in play to the crypt.',
    duration: 2,
    cost: 6,
    onPlay: (game) => {
      // Remove prevention effects
      game.removePreventionEffects();
      
      game.addEffect({
        duration: 2,
        onEffectAdded: (effect) => {
          if (effect.preventsCardPlay) {
            effect.card.sendToCrypt();
            return false;
          }
          return true;
        }
      });
    }
  },
  {
    id: 'colossal-rebirth',
    name: 'Colossal Rebirth',
    year: '2023',
    types: ['event', 'unidentifiable'],
    description: 'The Creatures of Colossus all reign under a special law...',
    effect: 'this card does not take up a slot on the field. play two cards from the crypt; place one in your hand, and one on the field. if both slots are full, gain 10 health.',
    duration: 0,
    cost: 9,
    onPlay: (game, player) => {
      if (player.crypt.length >= 2) {
        const cardForHand = game.chooseCard(player.crypt.cards);
        if (cardForHand) {
          cardForHand.removeFromCurrentLocation();
          player.hand.add(cardForHand);
        }

        const cardForField = game.chooseCard(player.crypt.cards);
        if (cardForField) {
          if (player.field.isFull()) {
            player.heal(10);
          } else {
            cardForField.removeFromCurrentLocation();
            player.playCard(cardForField);
          }
        }
      }
    }
  },
  {
    id: 'heavenly-fire',
    name: 'Heavenly Fire',
    year: '2023',
    types: ['event', 'unidentifiable'],
    description: 'Back! Back, you monsters!',
    effect: 'prevent the damage of any nonhuman cards for 2 rounds',
    duration: 2,
    cost: 4,
    onPlay: (game) => {
      game.addEffect({
        duration: 2,
        onDamageDealt: (damage, source) => {
          if (source.types.includes('nonhuman')) {
            return 0;
          }
          return damage;
        }
      });
    }
  },
  {
    id: 'firo',
    name: 'Firo',
    year: '2023',
    types: ['event', 'unidentifiable'],
    description: 'A fun intermediate spell for any caster willing to try...!',
    effect: 'this card deals 4 damage to your opponent, and 2 damage the next 2 rounds',
    duration: 2,
    cost: 5,
    onPlay: (game, player, opponent) => {
      opponent.takeDamage(4);
      game.addEffect({
        duration: 2,
        onRoundStart: () => {
          opponent.takeDamage(2);
        }
      });
    }
  },
  {
    id: 'gift-of-mercy',
    name: 'Gift of Mercy',
    year: '2023',
    types: ['event', 'unidentifiable'],
    description: 'They heard the humans cry for help and sent a gift; A donut that blasts a million degrees into one direct spot.\nYou\'d be surprised how many humans gathered.\nMany felt like this was the only way.',
    effect: 'offer 3 gold for your opponent to send their hand to the crypt. if they decline, deal 6 damage.',
    duration: 0,
    cost: 2,
    onPlay: (game, player, opponent) => {
      const accepted = game.askOpponentYesNo('Accept 3 gold to discard your hand?');
      if (accepted) {
        player.gold -= 3;
        opponent.gold += 3;
        while (opponent.hand.length > 0) {
          opponent.hand.removeRandom().sendToCrypt();
        }
      } else {
        opponent.takeDamage(6);
      }
    }
  },
  {
    id: 'peace-treaty',
    name: 'Peace Treaty',
    year: '2023',
    types: ['event'],
    description: 'Though fighting seemed to be the answer,\nboth parties decided peace was the ultimate solution.',
    effect: 'ask your opponent for a treaty. if they say yes, the game ends with both parties splitting their gold.',
    duration: 0,
    cost: 0,
    onPlay: (game, player, opponent) => {
      const accepted = game.askOpponentYesNo('Accept peace treaty?');
      if (accepted) {
        const totalGold = player.gold + opponent.gold;
        const splitGold = Math.floor(totalGold / 2);
        player.gold = splitGold;
        opponent.gold = splitGold;
        game.endGame('peace');
      }
    }
  },
  {
    id: 'repentance',
    name: 'Repentance',
    year: '2023',
    types: ['unidentifiable', 'event'],
    description: 'The warnings were true.\nThe scalding earth was now nothing more than a prison.\n-×-×-×-×-×-×-×-×-×-\nIf only they had acted sooner.',
    effect: 'roll a 6 sided die. Remove that number rolled from you and your enemy\'s health',
    duration: 0,
    cost: 3,
    onPlay: (game, player, opponent) => {
      const roll = game.rollDie(6);
      player.takeDamage(roll);
      opponent.takeDamage(roll);
    }
  },
  {
    id: 'the-end',
    name: 'The End',
    year: '2023',
    types: ['event'],
    description: 'The claws of fate finally ripped through.\n\nThe sky\'s galling mouth opened;\nAnd all they foretold was coming true...!',
    effect: 'if the opponent is at 10(20) gold or less, the opponent loses',
    duration: 0,
    cost: 8,
    onPlay: (game, player, opponent) => {
      if (opponent.gold <= 20) {
        game.endGame('victory', player);
      }
    }
  }
];

export const nonhumanCards: CardTemplate[] = [
  {
    id: 'chromax',
    name: 'Chromax',
    year: '2024',
    types: ['nonhuman', 'object', 'event'],
    description: 'the parallels are unmatched... summon their power at will..!',
    effect: 'this card is infinite until cleared. tally up the amount of celestial cards in play during this card\'s duration. deal 8 damage to your opponent every time your tally hits 5. restart and go again.',
    duration: -1, // Infinite
    cost: 12,
    onPlay: (game, player, opponent) => {
      let celestialCount = 0;
      game.addEffect({
        duration: -1,
        onCardPlayed: (card) => {
          if (card.types.includes('celestial')) {
            celestialCount++;
            if (celestialCount >= 5) {
              opponent.takeDamage(8);
              celestialCount = 0;
            }
          }
        }
      });
    }
  },
  {
    id: 'forest-witch',
    name: 'Forest Witch', 
    year: '2024',
    types: ['unidentifiable', 'location'],
    description: 'in Riverknot forest.... there\'s a hex that forces you to walk towards the center... like a trance...',
    effect: 'this card is infinite until cleared. tally up the amount of unidentifiable cards in play during this card\'s duration. deal 5 damage to your opponent every time your tally hits 5. restart and go again.',
    duration: -1, // Infinite
    cost: 9,
    onPlay: (game, player, opponent) => {
      let unidentifiableCount = 0;
      game.addEffect({
        duration: -1,
        onCardPlayed: (card) => {
          if (card.types.includes('unidentifiable')) {
            unidentifiableCount++;
            if (unidentifiableCount >= 5) {
              opponent.takeDamage(5);
              unidentifiableCount = 0;
            }
          }
        }
      });
    }
  },
  {
    id: 'island-du-gonzo',
    name: 'Island du Gonzo',
    year: '2024', 
    types: ['nonhuman', 'location'],
    description: 'home to a reclusive creator... the island seems to almost fade in and out of existence when accompanied by fog.',
    effect: 'this card is in play for 5 rounds. double the amount of gold you take in the first round. double the amount of damage you deal in the second round. negate any damage done to you in the third and fourth round. your opponent must send 10 gold to the bank in the final round. place this card at the bottom of your deck instead of sending it to the crypt.',
    duration: 5,
    cost: 10,
    onPlay: (game, player, opponent) => {
      let currentRound = 0;
      game.addEffect({
        duration: 5,
        onRoundStart: () => {
          currentRound++;
          if (currentRound === 1) {
            game.addEffect({
              duration: 1,
              onGoldReceived: (amount) => amount * 2
            });
          } else if (currentRound === 2) {
            game.addEffect({
              duration: 1,
              onDamageDealt: (damage) => damage * 2
            });
          } else if (currentRound === 3 || currentRound === 4) {
            game.addEffect({
              duration: 1,
              onDamageReceived: () => 0
            });
          } else if (currentRound === 5) {
            if (opponent.gold >= 10) {
              opponent.gold -= 10;
              game.bank.gold += 10;
            }
          }
        },
        onRemove: () => {
          const card = player.getCardById('island-du-gonzo');
          if (card) {
            card.removeFromCurrentLocation();
            player.deck.addToBottom(card);
          }
        }
      });
    }
  },
  {
    id: 'festival-of-lights',
    name: 'Festival Of Lights',
    year: '2024',
    types: ['nonhuman', 'location'],
    description: 'what started as a reason to sacrifice the village witch, turned into yearly sacrifices that summon the lights..',
    effect: 'this card is in play for 4 rounds. tally the amount of healing done during the duration of this card. heal for any number from that amount, and dealing the remaining amount in damage to your opponent when sending this card to the crypt.',
    duration: 4,
    cost: 6,
    onPlay: (game, player, opponent) => {
      let healingDone = 0;
      game.addEffect({
        duration: 4,
        onHeal: (amount) => {
          healingDone += amount;
          return amount;
        },
        onRemove: () => {
          if (healingDone > 0) {
            const healAmount = game.chooseNumber(0, healingDone);
            player.heal(healAmount);
            opponent.takeDamage(healingDone - healAmount);
          }
        }
      });
    }
  },
  {
    id: 'dust-bowl',
    name: 'Dust Bowl',
    year: '2024',
    types: ['nonhuman', 'location'],
    description: 'families continue to see flyers for a new life among the taverns, and travel to the dust bowl... just wait until sunset.',
    effect: 'this card is in play for 3 rounds. deal 1 damage to your opponent per round for each human card in play during this card\'s duration. extend this card\'s duration by 1 round for each human card in your hand each round.',
    duration: 3,
    cost: 5,
    onPlay: (game, player, opponent) => {
      game.addEffect({
        duration: 3,
        onRoundStart: () => {
          const humansInPlay = game.getCardsInPlay().filter(c => c.types.includes('human')).length;
          opponent.takeDamage(humansInPlay);
          
          const humansInHand = player.hand.filter(c => c.types.includes('human')).length;
          if (humansInHand > 0) {
            this.duration += humansInHand;
          }
        }
      });
    }
  },
  {
    id: 'skinlette',
    name: 'Skinlette',
    year: '2023',
    types: ['nonhuman'],
    description: 'The smell of sulfur fills the air... and out from trees; you spot it.',
    effect: 'this card is in play for 3 rounds. heal for: 1 health per unidentifiable card on the field, 2 per human, and 3 per celestial, in the first round. Repeat again in the third round. if the amount is the same both rounds, take 5 gold from your opponent and deal 5 damage.',
    duration: 3,
    cost: 8,
    onPlay: (game, player, opponent) => {
      let firstRoundHeal = 0;
      let currentRound = 0;
      
      game.addEffect({
        duration: 3,
        onRoundStart: () => {
          currentRound++;
          if (currentRound === 1 || currentRound === 3) {
            const cardsInPlay = game.getCardsInPlay();
            const healAmount = cardsInPlay.reduce((total, card) => {
              if (card.types.includes('unidentifiable')) total += 1;
              if (card.types.includes('human')) total += 2;
              if (card.types.includes('celestial')) total += 3;
              return total;
            }, 0);
            
            player.heal(healAmount);
            
            if (currentRound === 1) {
              firstRoundHeal = healAmount;
            } else if (healAmount === firstRoundHeal) {
              opponent.takeDamage(5);
              if (opponent.gold >= 5) {
                opponent.gold -= 5;
                player.gold += 5;
              }
            }
          }
        }
      });
    }
  },
  {
    id: 'spear-a-gott',
    name: 'Spear-a-gott',
    year: '2023',
    types: ['object', 'nonhuman'],
    description: 'the Ep\'catt use a particularly deadly weapon; one that never seems to fail...',
    effect: 'this card is in play for 4 rounds. heal an additional 1 health from all sources, and reduce your opponent\'s healing by 1 from all sources for the duration of this card.',
    duration: 4,
    cost: 4,
    onPlay: (game, player, opponent) => {
      game.addEffect({
        duration: 4,
        onHeal: (amount, target) => {
          if (target === player) return amount + 1;
          if (target === opponent) return Math.max(0, amount - 1);
          return amount;
        }
      });
    }
  },
  {
    id: 'avalons-toy-shelter',
    name: 'Avalon\'s Toy Shelter',
    year: '2023',
    types: ['location', 'nonhuman'],
    description: 'it used to be a shelter for kids... until they ran out of kids...',
    effect: 'play this card immediately when it is drawn. this card is in play for 5 rounds. forfeit 2 cards from your hand to the crypt to deal: 2 damage at the end of each round to your opponent for the duration of this card. the next card replacing this card will have a play cost of 0 gold.',
    duration: 5,
    cost: 7,
    onDraw: (game, player) => {
      player.playCard(this);
    },
    onPlay: (game, player, opponent) => {
      const cardsToForfeit = game.chooseCards(player.hand, 2);
      cardsToForfeit.forEach(card => {
        card.removeFromCurrentLocation();
        player.crypt.add(card);
      });
      
      game.addEffect({
        duration: 5,
        onRoundEnd: () => {
          opponent.takeDamage(2);
        },
        onRemove: () => {
          game.addEffect({
            duration: 1,
            onCardCost: () => 0
          });
        }
      });
    }
  },
  {
    id: 'bonobo-jungle',
    name: 'The Bonobo Jungle',
    year: '2023',
    types: ['location'],
    description: 'The group was headed towards a center of uncertainty...',
    effect: 'this card is in play for 4 rounds. tally the total amount of nonhuman cards during this card\'s duration, and use that amount as a stash that your opponent will take from instead of your actual gold. this amount remains indefinitely even after this card is sent to the crypt, and will prevent any gold from being taken until the total has been used up.',
    duration: 4,
    cost: 11,
    onPlay: (game, player) => {
      let nonhumanCount = 0;
      let goldStash = 0;
      
      game.addEffect({
        duration: 4,
        onCardPlayed: (card) => {
          if (card.types.includes('nonhuman')) {
            nonhumanCount++;
          }
        },
        onRemove: () => {
          goldStash = nonhumanCount;
          game.addEffect({
            duration: -1,
            onGoldTaken: (amount) => {
              if (goldStash > 0) {
                const takenFromStash = Math.min(amount, goldStash);
                goldStash -= takenFromStash;
                return 0;
              }
              return amount;
            }
          });
        }
      });
    }
  },
  {
    id: 'ungo-wrath',
    name: 'Un\'go\'s Wrath',
    year: '2023',
    types: ['unidentifiable', 'location'],
    description: '...a prophecy was foretold that he would return once again..!',
    effect: 'this card is in play for 3 rounds. if at any point in time you have a human or nonhuman card in your hand, deal 6 damage once per round to your opponent. Add an additional 3 damage once per round if Un\'go and Un\'go\'s Chalice are on either side of the field. remove this card from play. only one card per deck.',
    duration: 3,
    cost: 10,
    onPlay: (game, player, opponent) => {
      game.addEffect({
        duration: 3,
        onRoundStart: () => {
          const hasValidCard = player.hand.some(card => 
            card.types.includes('human') || card.types.includes('nonhuman')
          );
          
          if (hasValidCard) {
            let damage = 6;
            
            const hasUngo = game.getCardsInPlay().some(c => c.id === 'ungo');
            const hasUngoChalice = game.getCardsInPlay().some(c => c.id === 'ungo-chalice');
            
            if (hasUngo && hasUngoChalice) {
              damage += 3;
            }
            
            opponent.takeDamage(damage);
          }
        }
      });
    }
  },
  {
    id: 'continuum-transfunctioner',
    name: 'Continuum Transfunctioner',
    year: '2023',
    types: ['unidentifiable', 'object'],
    description: 'A scientific breakthrough once vaulted by G. Lab. before they disappeared....',
    effect: 'this card is in play for 3 rounds. reverse the flow of the cards (draw from the crypt, discard to the stack) for the duration of this card.',
    duration: 3,
    cost: 6,
    onPlay: (game, player) => {
      game.addEffect({
        duration: 3,
        onDraw: () => {
          const card = player.crypt.drawCard();
          if (card) {
            player.hand.add(card);
            return false; // Prevent normal draw
          }
          return true;
        },
        onDiscard: (card) => {
          card.removeFromCurrentLocation();
          player.deck.addToTop(card);
          return false; // Prevent normal discard
        }
      });
    }
  },
  {
    id: 'art-of-rooster',
    name: 'Art Of Rooster',
    year: '2023',
    types: ['passive', 'unidentifiable'],
    description: '...the defensive escape. A classic!',
    effect: 'this card is in play for 3 rounds. every round, add an additional 3 to the amount of damage you take from your opponent and 3 to the amount of gold you take from your opponent. take 13 gold from your opponent if this card is cleared.',
    duration: 3,
    cost: 8,
    onPlay: (game, player, opponent) => {
      game.addEffect({
        duration: 3,
        onDamageReceived: (damage) => damage + 3,
        onGoldReceived: (amount) => amount + 3,
        onRemove: () => {
          if (opponent.gold >= 13) {
            opponent.gold -= 13;
            player.gold += 13;
          }
        }
      });
    }
  },
  {
    id: 'party-trick',
    name: 'Party Trick',
    year: '2023',
    types: ['passive', 'unidentifiable'],
    description: 'Casters were banned from most normal gatherings...',
    effect: 'every 2 rounds, transfer 1 gold from your out-of-game stash into your in-game stash. this card is a passive, and in play indefinitely until the user decides or is otherwise cleared.',
    duration: -1,
    cost: 4,
    onPlay: (game, player) => {
      let roundCount = 0;
      game.addEffect({
        duration: -1,
        onRoundStart: () => {
          roundCount++;
          if (roundCount % 2 === 0) {
            player.gold++;
          }
        }
      });
    }
  },
  {
    id: 'yatesuratsu',
    name: 'Yatesuratsu',
    year: '2023',
    types: ['nonhuman', 'unidentifiable'],
    description: '...some describe him in dreams... before they go missing.',
    effect: 'this card is in play for 3 rounds. once per round, your opponent must send their most expensive card from their hand to the crypt. have someone else verify.',
    duration: 3,
    cost: 8,
    onPlay: (game, player, opponent) => {
      game.addEffect({
        duration: 3,
        onRoundStart: () => {
          const mostExpensiveCard = opponent.hand.reduce((prev, curr) => 
            (curr.cost > prev.cost) ? curr : prev
          );
          if (mostExpensiveCard) {
            mostExpensiveCard.removeFromCurrentLocation();
            opponent.crypt.add(mostExpensiveCard);
          }
        }
      });
    }
  },
  {
    id: 'yodkai',
    name: 'Yodkai',
    year: '2023',
    types: ['nonhuman', 'unidentifiable'],
    description: 'An elusive creature that\'s only ever captured on footage...',
    effect: 'this card is in play for 3 rounds. tally up the amount of unidentifiable cards played during its duration, dealing that amount in damage to your opponent when sending this card to the crypt. place this card back into your hand if it is cleared by your opponent and refund the summon gold.',
    duration: 3,
    cost: 10,
    onPlay: (game, player, opponent) => {
      let unidentifiableCount = 0;
      game.addEffect({
        duration: 3,
        onCardPlayed: (card) => {
          if (card.types.includes('unidentifiable')) {
            unidentifiableCount++;
          }
        },
        onRemove: () => {
          opponent.takeDamage(unidentifiableCount);
        },
        onCleared: () => {
          player.gold += this.cost;
          this.removeFromCurrentLocation();
          player.hand.add(this);
        }
      });
    }
  },
  {
    id: 'her-spirit',
    name: 'Her Spirit',
    year: '2023',
    types: ['nonhuman', 'unidentifiable'],
    description: 'She exists indefinitely...\nThe presence of her spirit...',
    effect: 'this card is in play for 2 rounds. reduce any of your opponent\'s gold income by 3, and increase any of your gold income by 3 for the duration of this card. this card can stack with each effect already in play.',
    duration: 2,
    cost: 7,
    onPlay: (game, player, opponent) => {
      game.addEffect({
        duration: 2,
        onGoldReceived: (amount, target) => {
          if (target === player) return amount + 3;
          if (target === opponent) return Math.max(0, amount - 3);
          return amount;
        }
      });
    }
  },
  {
    id: 'madame-nilah',
    name: 'Madame Nilah',
    year: '2023',
    types: ['nonhuman', 'unidentifiable'],
    description: 'She seemed normal to her people... until servants, guests, and even townsfolk started disappearing...',
    effect: 'this card is in play for 3 rounds. deal 2 damage each round and an additional 2 damage per 1 gold taken by your opponent during the duration',
    duration: 3,
    cost: 5,
    onPlay: (game, player, opponent) => {
      let goldTaken = 0;
      game.addEffect({
        duration: 3,
        onRoundStart: () => {
          opponent.takeDamage(2 + (goldTaken * 2));
        },
        onGoldTaken: (amount) => {
          goldTaken += amount;
          return amount;
        }
      });
    }
  },
  {
    id: 'madame-nilah-bracelet',
    name: 'Madame Nilah\'s Bracelet',
    year: '2023',
    types: ['object'],
    description: '...this is the infamous band that was found when the townsfolk stormed the castle...',
    effect: 'this card is in play for 3 rounds. draw from the crypt instead of your deck for the duration of this card. each round, deal half of the card\'s summoning gold in damage to your opponent',
    duration: 3,
    cost: 10,
    onPlay: (game, player, opponent) => {
      game.addEffect({
        duration: 3,
        onDraw: () => {
          const card = player.crypt.drawCard();
          if (card) {
            player.hand.add(card);
            opponent.takeDamage(Math.floor(card.cost / 2));
            return false; // Prevent normal draw
          }
          return true;
        }
      });
    }
  },
  {
    id: 'nyton-arena',
    name: 'Nyton Arena',
    year: '2023',
    types: ['location'],
    description: 'here.... the fights never seem to end...',
    effect: 'this card is in play for 3 rounds. any attack done by either side rewards them with gold from the bank (1 gold per 2 damage done). if the bank has no gold, gain health at the same rate.',
    duration: 3,
    cost: 7,
    onPlay: (game, player, opponent) => {
      game.addEffect({
        duration: 3,
        onDamageDealt: (damage, source) => {
          const goldToGive = Math.floor(damage / 2);
          if (game.bank.gold >= goldToGive) {
            game.bank.gold -= goldToGive;
            source.gold += goldToGive;
          } else {
            source.heal(goldToGive);
          }
          return damage;
        }
      });
    }
  },
  {
    id: 'ungo-chalice',
    name: 'Un\'go\'s Chalice',
    year: '2023',
    types: ['object'],
    description: 'The weapon of a mass murderer; \nit harnesses the blood of those killed to feed whatever is inside...',
    effect: 'this card is in play for 2 rounds. deal 3 damage per round for each card that is cleared or sent to the crypt during its duration. deal an additional 2 per round if Un\'go is on either side of the field. this card cannot be cleared. only one card per deck.',
    duration: 2,
    cost: 10,
    onPlay: (game, player, opponent) => {
      let cardsCleared = 0;
      game.addEffect({
        duration: 2,
        onCardCleared: () => {
          cardsCleared++;
        },
        onCardSentToCrypt: () => {
          cardsCleared++;
        },
        onRoundStart: () => {
          let damage = cardsCleared * 3;
          if (game.getCardsInPlay().some(c => c.id === 'ungo')) {
            damage += 2;
          }
          opponent.takeDamage(damage);
        },
        canBeCleared: false
      });
    }
  },
  {
    id: 'witches-pamphlet',
    name: 'The Witches\' Pamphlet',
    year: '2023',
    types: ['object', 'unidentifiable'],
    description: 'Made by a banished caster, these are the work of a mad genius..!',
    effect: 'this card is in play for 3 rounds. roll a six sided die, and add 2 to your roll. each round, take 1 card with equal or less gold summon from the crypt and shuffle it back into your deck.',
    duration: 3,
    cost: 7,
    onPlay: (game, player) => {
      const roll = game.rollDie(6) + 2;
      game.addEffect({
        duration: 3,
        onRoundStart: () => {
          const eligibleCards = player.crypt.cards.filter(card => card.cost <= roll);
          if (eligibleCards.length > 0) {
            const chosenCard = game.chooseCard(eligibleCards);
            chosenCard.removeFromCurrentLocation();
            player.deck.shuffle([chosenCard]);
          }
        }
      });
    }
  },
  {
    id: 'porcus-aureus',
    name: 'Porcus Aureus',
    year: '2023',
    types: ['nonhuman', 'event'],
    description: 'The townspeople fear it... for once a year, it demands we feed it money... or else...',
    effect: 'this card is in play for 3 rounds. each round, you and your opponent roll a 6 sided die. if your opponent rolls a higher combined total than you, nothing happens. if you roll higher than your opponent, take 12 gold from the bank. if there is not enough, take what is there and add the remaining to your health. you can only play this card once.',
    duration: 3,
    cost: 7,
    onPlay: (game, player) => {
      let hasBeenPlayed = false;
      if (!hasBeenPlayed) {
        hasBeenPlayed = true;
        game.addEffect({
          duration: 3,
          onRoundStart: () => {
            const playerRoll = game.rollDie(6);
            const opponentRoll = game.rollDie(6);
            
            if (playerRoll > opponentRoll) {
              if (game.bank.gold >= 12) {
                game.bank.gold -= 12;
                player.gold += 12;
              } else {
                const remainingGold = 12 - game.bank.gold;
                player.gold += game.bank.gold;
                game.bank.gold = 0;
                player.heal(remainingGold);
              }
            }
          }
        });
      }
    }
  }
];

// Combine all card collections
export const allCards: CardTemplate[] = [
  ...humanCards,
  ...celestialCards,
  ...eventCards,
  ...nonhumanCards
];