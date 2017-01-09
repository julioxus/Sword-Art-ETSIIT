//=============================================================================
// Ramza Tweaks - True Dual Wielding
// RamzaDualWield.js
//=============================================================================
 /*:
 * @title Ramza Tweaks - True Dual Wielding
 * @author Ramza (http://www.manaconquest.com)
 * @date Mar 6, 2016
 * @filename RamzaDualWield.js
 * @plugindesc v1.05 Changes the default behavior of dual wielding REQUIRES YANFLY'S WEAPON ANIMATIONS AND ACTION SEQUENCE PLUGINS TO FUNCTION
 * ============================================================================
 * Terms of Use
 * ============================================================================
 *
 *   - Free for commercial and non-commercial use
 *   - Adhere to Yanfly's terms of use as well
 *	 - Credit to myself is not necessary, although is appreciated
 *	 - Modification of my base code for improvement or bugfixes is appreciated
 * 
 * ============================================================================
 * Requirements
 * ============================================================================
 * - Yanfly's action sequence plugins and all of their requirements
 * - Yanfly's Weapon Animation plugin
 * - Yanfly's autopassive states plugin is recommended
 * ============================================================================
 * Parameters
 * ============================================================================
 * @param ---Variables---
 * @param Math Variable 1
 * @desc The first of four in game variables required to save information 
 * between actions. ensure that this variable isn't used anywhere in game
 * @default 15
 * 
 * @param Math Variable 2
 * @desc The second required math variable
 * @default 16
 * 
 * @param Math Variable 3
 * @desc The third required math variable 
 * @default 17
 * 
 * @param Math Variable 4
 * @desc the fourth required math variable 
 * @default 18
 *
 * @param Math Variable 5
 * @desc the fifth required math variable 
 * @default 19
 *
 * @param Action Before Animation
 * @desc Set this variable to true if your action sequences do the attack action effect BEFORE doing the attack animation 
 * @default true
 *
 * @help
 * ============================================================================
 * Description
 * ============================================================================
 *
 * This plugin modifies the default behavior of dual wielding in your game.
 * An actor who is wielding two weapons, and attacks with any ability that
 * hits more than once will alternate between the animation/spritesheet/swingtype
 * of his mainhand and offhand weapons.
 * Actors that do not deal multiple attacks will be unaffected
 * It is recommended that dualwielding be applied as a state to an actor,
 * giving him a second attack. 
 * 
 * NEW IN 1.01b:
 * A new miss script can be called if you run a conditional hit animation in your
 * action sequence, which will force the next attack after a 'miss' action effect
 * to deal the correct damage of a normal attack. 
 *
 * If you don't call this script at all, the previous functionality still exists,
 * where a missed attack causes the following attack to repeat damage/graphics
 * of the missed attack, as if the user were re-attempting an attack with the same
 * weapon that he/she just missed with.
 * 
 *
 * NEW IN 1.01:
 * Dual wielding attacks will automatically do damaged based individually on the 
 * weapon equipped in the hand that is doing the attack. If you have a weak weapon
 * in one hand, and strong weapon in the offhand, the damage will show that.
 * 
 *
 * ============================================================================
 * Known Issues:
 * ============================================================================
 *	The following non-game breaking core issues have been documented:
 *
 *  If you have Action Before Animation is set to true, and you call an attack 
 *  animation where the animation is played BEFORE the action effect, weapon
 *  metadata will be lost.
 *
 *	If an actor is dualwield type, but only has a weapon in his offhand, 
 *	his first and all subsequent attacks will use the weaponsheet and 
 *	battle animation of his second weapon. If he's dual wielding no weapons
 *	both attacks show no weapon, and the unarmed attack animation as
 *	expected
 *
 *	You need to call RamzaDWCleanup() during the finish action of your action 
 *	sequence to ensure that weapon data is not lost due to odd numbers of hits
 *
 *	NOT an issue:
 *
 *	If using a skill with multiple individual hits, the dualwield actor
 *	will alternate main and offhand attacks, as long as 'attack animation'
 *	is used in the action sequence. To prevent this for specific skills, 
 *	refrain from using 'attack animation' in the action sequence. This was
 *	a design choice. 
 *	
 * ============================================================================
 * Setup:
 * ============================================================================
 * It is highly recommended that you be using Yanfly's action sequence plugins
 * in order to properly cleanup after a dualwield attack. It's possible to use
 * event commands to accomplish the same thingm however.
 * 
 * Ensure the variables set in the parameters are not being used for aanything
 * else. If any of their values are changed outside of this plugin, it could 
 * result in the loss of the information that determines a weapon's animation
 *
 * Ensure that all weapons are using the <Weapon Image: x> tag from Yanfly's
 * weapon animation plugin, as the weaponsprite is added to the weapon from
 * that note tag 
 *
 * You must call the function RamzaDMGsetup(user); from within the setup action
 * of your action sequence if you run your action effect before your attack 
 * animation in the action sequence. Failure to do this will result in 
 * weapon metadata loss, and erroneous atk stat changes on the mainhand weapon
 *
 * ============================================================================
 * Usage:
 * ============================================================================
 * This plugin replaces the default battle animation behavior as long as it 
 * detects that the attacker is an actor.
 * 
 * If your attack or skill action sequences do an action effect BEFORE showing
 * the attack animation, you must have the 'Action Before Animation' parameter 
 * true, and you must also call RamzaDMGsetup(user) from your setup action,
 * otherwise the mainhand weapon will errantly inherit the attack of the 
 * offhand weapon.
 *
 * In the finish sequence of your action sequence, you must place a call to the
 * cleanup function. I recommend it be placed in the attack skill action sequence
 * as well as the action sequence of any other skills that would utilize the 
 * 'perform action: user' tag.
 *
 * Cleanup is REQUIRED whenever an odd number of attacks are performed. 
 * If your attack doesn't call the 'attack animation' sequence for whatever reason
 * (conditional miss?), it will not count as a mainhand swing.
 *
 * Either call the following function directly from your action sequence, or call
 * a common event that calls the function from a script call. Ensure that it is not
 * called from inside the whole or target action sequence sections, as that could
 * result in loss of weapon metadata
 *
 * RamzaDWCleanup()

 Example 'action effect before animation' action sequence:
<Setup Action>
	display action
	eval: RamzaDMGsetup(user);
	if user.attackMotion() !== 'missile'
		move user: target, front base, 20
		wait for move
	end
	immortal: target, true
</Setup Action>
<Target Action>
	wait: 15
	perform action: user
	action effect: target
	if target.result().isHit()
		attack animation: target
		wait for animation
	else
		eval: RamzaDWMissCorrection(user);
	end
	wait: 20
</Target Action>
<Finish Action>
	clear battle log
	perform finish
	eval: RamzaDWCleanup();
	wait: 10
	immortal: target, false
</Finish Action>
 
 * ============================================================================
 * Change Log
 * ============================================================================
 * 1.0.5 - Fixed a compatibility issue with Yanfly's Weapon Animation Plugin.
 *		   If dual wielding, and the first attack misses, the second attack will
 *         no longer have the weaponsprite or swing animation of the missed attack
 *         this was caused by two cached variables being used to perform the actual
 *		   attack, and my updating values that were not actively being used.
 * 
 * 1.0.1c- Fixed an issue with the cleanup script not working properly
 * 
 * 1.0.1b- Added a new function to call in the event of a miss for action
 *         sequences that call the action effect before the attack animation
 *         to increase the step counter and setup for the second attack as if
 *         it had detected a hit. RamzaDWMissCorrection(subject)
 *
 * 1.0.1 - Actors do damage per hand based on the weapon in that hand
 * 		   skills that only hit once and do not use the 'attack animation' 
 * 		   will do normal damage. 
 *		 - Attacks that hit once and DO use 'attack animation' will only do
 *		   damage based on the mainhand weapon only.
 * 		 - fixed a bug where an actor with one weapon attacking after
 *		   a dual wield actor who had used an odd number of attacks
 *		   would errantly inherit the dual wield actor's mainhand metadata
 * 1.0.0 - Initial Release
 */
//=============================================================================

//=============================================================================
var Imported = Imported || {} ;
var RDW = RDW || {};
Imported.DualWield = 1;
RDW.Dualwield = RDW.Dualwield || {};
	
(function() {	

   	//=============================================================================
	// Parameter Variables
	//=============================================================================

	var parameters = PluginManager.parameters('RamzaDualWield');
	
	var usedvar01 		=	Number(parameters['Math Variable 1']); 
	var usedvar02 		=	Number(parameters['Math Variable 2']);
	var usedvar03 		=	Number(parameters['Math Variable 3']);
	var usedvar04 		=	Number(parameters['Math Variable 4']);
	var usedvar05 		=	Number(parameters['Math Variable 5']);
	var actanimation	=	String(parameters['Action Before Animation']);
	
	Window_BattleLog.prototype.showActorAttackAnimation = function(subject, targets) {
		var temp21 = $gameVariables.value(usedvar01) + 1
		var temp22 = temp21 % 2
		//odd attack
		if (temp22 == 1) {
		if (actanimation == 'false') {
			RamzaDMGsetup(subject);
		}	
			this.showNormalAnimation(targets, subject.attackAnimationId1(), false);
				//does the actor have an offhand weapon equipped?
			if (subject.attackAnimationId2() != 0) {
				//set up weapon swing for second attack
				var stuff = $dataWeapons[$gameActors._data[subject.actorId()]._equips[0]._itemId].weaponImageIndex
				//has this already been set?
				if ($gameVariables.value(usedvar03) == 0 ) {
					$gameVariables.setValue(usedvar02, $dataWeapons[$gameActors._data[subject.actorId()]._equips[0]._itemId].id)
					$gameVariables.setValue(usedvar03, $dataWeapons[$gameActors._data[subject.actorId()]._equips[0]._itemId].weaponImageIndex)
					$gameVariables.setValue(usedvar04, $dataWeapons[$gameActors._data[subject.actorId()]._equips[0]._itemId].weaponAttackMotion)
					
				}
				//swap values of mainhand and offhand
				$dataWeapons[$gameActors._data[subject.actorId()]._equips[0]._itemId].weaponImageIndex = $dataWeapons[$gameActors._data[subject.actorId()]._equips[1]._itemId].weaponImageIndex
				$dataWeapons[$gameActors._data[subject.actorId()]._equips[0]._itemId].weaponAttackMotion = $dataWeapons[$gameActors._data[subject.actorId()]._equips[1]._itemId].weaponAttackMotion
				$dataWeapons[$gameActors._data[subject.actorId()]._equips[1]._itemId].params[2] = $dataWeapons[$gameActors._data[subject.actorId()]._equips[1]._itemId].params[2] + $gameVariables.value(usedvar05)
				$gameVariables.setValue(usedvar05, $dataWeapons[$gameActors._data[subject.actorId()]._equips[0]._itemId].params[2])
				$dataWeapons[$gameActors._data[subject.actorId()]._equips[0]._itemId].params[2] = $dataWeapons[$gameActors._data[subject.actorId()]._equips[0]._itemId].params[2] - $gameVariables.value(usedvar05)
				}
		//even attack does attacker have an offhand weapon?
		} else if (subject.attackAnimationId2() != 0) {
			console.log($dataWeapons[$gameActors._data[subject.actorId()]._equips[0]._itemId].weaponImageIndex)
			this.showNormalAnimation(targets, subject.attackAnimationId2(), false);
			//setup weapons for mainhand attack
			if ($gameVariables.value(usedvar03) != $dataWeapons[$gameActors._data[subject.actorId()]._equips[0]._itemId].weaponImageIndex) {
				$dataWeapons[$gameActors._data[subject.actorId()]._equips[0]._itemId].weaponImageIndex = $gameVariables.value(usedvar03)
				$dataWeapons[$gameActors._data[subject.actorId()]._equips[0]._itemId].weaponAttackMotion = $gameVariables.value(usedvar04)
				$dataWeapons[$gameActors._data[subject.actorId()]._equips[0]._itemId].params[2] = $dataWeapons[$gameActors._data[subject.actorId()]._equips[0]._itemId].params[2] + $gameVariables.value(usedvar05)
				$gameVariables.setValue(usedvar03, 0)
				$gameVariables.setValue(usedvar04, 0)
				$gameVariables.setValue(usedvar05, 0)
			}
		//even attack the attacker doesn't have an offhand weapon
		} else {
			this.showNormalAnimation(targets, subject.attackAnimationId1(), false);
//			$gameVariables.setValue(usedvar01, temp21)
//			if ($gameVariables.value(usedvar03) != $dataWeapons[$gameActors._data[subject.actorId()]._equips[0]._itemId].weaponImageIndex) {
//				$dataWeapons[$gameActors._data[subject.actorId()]._equips[0]._itemId].weaponImageIndex = $gameVariables.value(usedvar03)
//				$dataWeapons[$gameActors._data[subject.actorId()]._equips[0]._itemId].weaponAttackMotion = $gameVariables.value(usedvar04)
//				$gameVariables.setValue(usedvar03, 0)
//				$gameVariables.setValue(usedvar04, 0)
//			}
		}
		//if the attacker has an offhand weapon increase step so next attack will be an offhand hit
		if (subject.attackAnimationId2() != 0) {
		$gameVariables.setValue(usedvar01, temp21)  
		}
	};
	RamzaDWCleanup = function() {
	//	resets the parameters of the main hand weapon if it determines an odd number of attacks occurred
	if ($gameVariables.value(usedvar03) != 0) {
		var fix = $gameVariables.value(usedvar02)
		var fix2 = $gameVariables.value(usedvar03)
		var fix3 = $gameVariables.value(usedvar04)
		var fix4 = $gameVariables.value(usedvar05)
		$dataWeapons[fix].weaponImageIndex = fix2
		$dataWeapons[fix].weaponAttackMotion = fix3
		$dataWeapons[fix].params[2] = fix4
		$gameVariables.setValue(usedvar05, 0)
		$gameVariables.setValue(usedvar04, 0)
		$gameVariables.setValue(usedvar03, 0)
		$gameVariables.setValue(usedvar02, 0)
		$gameVariables.setValue(usedvar01, 0)
//		console.log("fixed")
		}
	}
	RamzaDMGsetup = function(subject) {
	// call during the setup action in a sequence to temporarily reduce the attacking actors total attack by 
	// the value of his offhand weapon (if he has one). This is only necessary if your action sequence is 
	// calling action effect: target before showing the attack animation
	if (subject.isActor() == true) {
		if (subject.attackAnimationId2() != 0) {
		if ($dataWeapons[$gameActors._data[subject.actorId()]._equips[1]._itemId].params[2] != 0) {
			$gameVariables.setValue(usedvar05, $dataWeapons[$gameActors._data[subject.actorId()]._equips[1]._itemId].params[2])
			$dataWeapons[$gameActors._data[subject.actorId()]._equips[1]._itemId].params[2] = $dataWeapons[$gameActors._data[subject.actorId()]._equips[1]._itemId].params[2] - $gameVariables.value(usedvar05)
		}
	}
	}
	}
	RamzaDWMissCorrection = function(subject) {
	// call during the target phase of an action sequence when a miss was detected from the previous hit
	// should only be used when the action effect is called before attack animation
	// will increase step count and setup for the second swing as if the attack had hit
	if (subject.isActor() == true) {
		var temp21 = $gameVariables.value(usedvar01) + 1
		var temp22 = temp21 % 2
		//odd attack missed
		if (temp22 == 1) {
			if (subject.attackAnimationId2() != 0) {
				console.log("step1")
				if ($gameVariables.value(usedvar03) == 0 ) {
					console.log("step2")
					$gameVariables.setValue(usedvar02, $dataWeapons[$gameActors._data[subject.actorId()]._equips[0]._itemId].id)
					$gameVariables.setValue(usedvar03, $dataWeapons[$gameActors._data[subject.actorId()]._equips[0]._itemId].weaponImageIndex)
					console.log($gameVariables.value(usedvar03))
					console.log($gameActors._data[subject.actorId()]._cacheWeaponImage)
					$gameVariables.setValue(usedvar04, $dataWeapons[$gameActors._data[subject.actorId()]._equips[0]._itemId].weaponAttackMotion)
					
				}
				//swap values of mainhand and offhand
				$dataWeapons[$gameActors._data[subject.actorId()]._equips[0]._itemId].weaponImageIndex = $dataWeapons[$gameActors._data[subject.actorId()]._equips[1]._itemId].weaponImageIndex
				$dataWeapons[$gameActors._data[subject.actorId()]._equips[0]._itemId].weaponAttackMotion = $dataWeapons[$gameActors._data[subject.actorId()]._equips[1]._itemId].weaponAttackMotion
				console.log($dataWeapons[$gameActors._data[subject.actorId()]._equips[0]._itemId].weaponImageIndex)
				console.log($gameActors._data[subject.actorId()]._cacheWeaponImage)
				$gameActors._data[subject.actorId()]._cacheWeaponImage = undefined
				$gameActors._data[subject.actorId()]._cacheWeaponMotion = undefined
				//				$gameActors._data[subject.actorId()]._cacheWeaponImage = $dataWeapons[$gameActors._data[subject.actorId()]._equips[0]._itemId].weaponImageIndex
				$dataWeapons[$gameActors._data[subject.actorId()]._equips[1]._itemId].params[2] = $dataWeapons[$gameActors._data[subject.actorId()]._equips[1]._itemId].params[2] + $gameVariables.value(usedvar05)
				$gameVariables.setValue(usedvar05, $dataWeapons[$gameActors._data[subject.actorId()]._equips[0]._itemId].params[2])
				$dataWeapons[$gameActors._data[subject.actorId()]._equips[0]._itemId].params[2] = $dataWeapons[$gameActors._data[subject.actorId()]._equips[0]._itemId].params[2] - $gameVariables.value(usedvar05)
				}
		} else if (subject.attackAnimationId2() != 0){
		// even attack missed
			if ($gameVariables.value(usedvar03) != $dataWeapons[$gameActors._data[subject.actorId()]._equips[0]._itemId].weaponImageIndex) {
				$dataWeapons[$gameActors._data[subject.actorId()]._equips[0]._itemId].weaponImageIndex = $gameVariables.value(usedvar03)
				$dataWeapons[$gameActors._data[subject.actorId()]._equips[0]._itemId].weaponAttackMotion = $gameVariables.value(usedvar04)
				$dataWeapons[$gameActors._data[subject.actorId()]._equips[0]._itemId].params[2] = $dataWeapons[$gameActors._data[subject.actorId()]._equips[0]._itemId].params[2] + $gameVariables.value(usedvar05)
				$gameVariables.setValue(usedvar03, 0)
				$gameVariables.setValue(usedvar04, 0)
				$gameVariables.setValue(usedvar05, 0)
			}
		} else {
			// no offhand animation
		 
	}
		//if the attacker has an offhand weapon increase step so next attack will be an offhand hit
		if (subject.attackAnimationId2() != 0) {
		$gameVariables.setValue(usedvar01, temp21)
		}		
		}
	}
}) (RDW.DualWield);