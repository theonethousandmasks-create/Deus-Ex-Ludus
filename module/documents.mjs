import { Actor, Item, ChatMessage, Roll } from "foundry:api";

export class SystemActor extends Actor {
  async rollSkill(skillName) {
    const tn = this.system.skills[skillName];
    if (!tn) {
      ui.notifications.warn(`Skill ${skillName} not found.`);
      return;
    }
    const roll = await new Roll("1d100").evaluate();
    const result = roll.total;
    let degree = 0;
    let type = "";
    if (result <= tn) {
      degree = Math.floor((tn - result) / 10) + 1;
      type = "success";
    } else {
      degree = Math.floor((result - tn) / 10) + 1;
      type = "failure";
    }
    const content = `Rolled ${result} against TN ${tn} for ${skillName}. ${type === "success" ? game.i18n.localize("SUCCESS") : game.i18n.localize("FAILURE")} with ${type === "success" ? game.i18n.localize("DEGREE_OF_SUCCESS") : game.i18n.localize("DEGREE_OF_FAILURE")} ${degree}`;
    await ChatMessage.implementation.create({
      content: content,
      rolls: [roll]
    });
    return { result, degree, type };
  }
}

export class SystemItem extends Item {
  // Custom item logic can go here
}