// utils/components.js
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const { EMOJIS, VIP_CASINOS } = require('../config/constants');

class ComponentFactory {
  static styleMap = {
    blue: ButtonStyle.Primary,
    grey: ButtonStyle.Secondary,
    green: ButtonStyle.Success,
    red: ButtonStyle.Danger
  };

  static createButton(customId, label, style = ButtonStyle.Primary, emoji = null, disabled = false) {
    const button = new ButtonBuilder()
      .setCustomId(customId)
      .setLabel(label)
      .setStyle(style)
      .setDisabled(disabled);
    
    if (emoji) button.setEmoji(emoji);
    return button;
  }

  static createLinkButton(url, label, emoji = null) {
    const button = new ButtonBuilder()
      .setURL(url)
      .setLabel(label)
      .setStyle(ButtonStyle.Link);
    
    if (emoji) button.setEmoji(emoji);
    return button;
  }

  static createButtonRow(...buttons) {
    return new ActionRowBuilder().addComponents(...buttons);
  }

  static nextStepButton() {
    return this.createButton('proof_next', 'Próximo Passo', ButtonStyle.Primary, EMOJIS.STAR);
  }

  static finishButton() {
    return this.createButton('finish_ticket', 'Finalizar', ButtonStyle.Success, EMOJIS.SUCCESS);
  }

  static supportButton() {
    return this.createButton('support_ticket', 'Falar com Suporte', ButtonStyle.Danger, EMOJIS.SHIELD);
  }

  static closeTicketButton() {
    return this.createButton('close_ticket_menu', 'Fechar Ticket', ButtonStyle.Secondary, '🔒');
  }

  // === WEBSITE BUTTONS ===
  static websiteTypeButtons() {
    return this.createButtonRow(
      this.createButton('website_bug', 'Reportar Bug', ButtonStyle.Danger, '🐛'),
      this.createButton('website_redeem', 'Resgatar Redeem', ButtonStyle.Success, '🎁'),
      this.supportButton(),
      this.closeTicketButton()
    );
  }

  static redeemSelectButtons(redeems) {
    const buttons = [];
    const maxButtons = Math.min(redeems.length, 3); // Máximo 3 botões para deixar espaço para suporte e fechar
    
    for (let i = 0; i < maxButtons; i++) {
      buttons.push(
        this.createButton(
          `select_redeem_${redeems[i].id}`,
          `${i + 1}. ${redeems[i].itemName.substring(0, 15)}${redeems[i].itemName.length > 15 ? '...' : ''}`,
          ButtonStyle.Primary,
          '🎁'
        )
      );
    }
    
    // Add support and close buttons
    buttons.push(this.supportButton());
    buttons.push(this.closeTicketButton());
    
    return this.createButtonRow(...buttons);
  }

  static markRedeemCompleteButton(redeemId) {
    return this.createButtonRow(
      this.createButton(`mark_redeem_complete_${redeemId}`, 'Marcar Redeem como Concluído', ButtonStyle.Success, '✅'),
      this.createButton('close_with_transcript', 'Fechar com Transcript', ButtonStyle.Secondary, '📋'),
      this.createButton('close_delete_ticket', 'Eliminar Ticket', ButtonStyle.Danger, '🗑️')
    );
  }

  // === STEP BUTTONS WITH SUPPORT AND CLOSE ===
  static stepButtons() {
    return this.createButtonRow(
      this.nextStepButton(),
      this.supportButton(),
      this.closeTicketButton()
    );
  }

  static finishButtons() {
    return this.createButtonRow(
      this.finishButton(),
      this.supportButton(),
      this.closeTicketButton()
    );
  }

  static resubmitButtons() {
    return this.createButtonRow(
      this.createButton('rejection_resubmit', 'Reenviar', ButtonStyle.Primary, '🔄'),
      this.supportButton(),
      this.closeTicketButton()
    );
  }

  static closeTicketButtons() {
    return this.createButtonRow(
      this.createButton('close_with_transcript', 'Fechar com Transcript', ButtonStyle.Success, '📋'),
      this.createButton('close_delete_ticket', 'Eliminar Ticket', ButtonStyle.Danger, '🗑️')
    );
  }

  static transcriptButtons(transcriptId) {
    return this.createButtonRow(
      this.createButton(`view_transcript_${transcriptId}`, 'Ver Transcript', ButtonStyle.Primary, '📋'),
      this.createButton(`download_transcript_${transcriptId}`, 'Download', ButtonStyle.Secondary, '💾')
    );
  }

  static giveawayTypeButtons() {
    return this.createButtonRow(
      this.createButton('gw_type_telegram', 'Telegram', ButtonStyle.Primary, '📱'),
      this.createButton('gw_type_gtb', 'GTB', ButtonStyle.Secondary, EMOJIS.STAR),
      this.createButton('gw_type_other', 'Outro', ButtonStyle.Secondary, EMOJIS.GIFT)
    );
  }

  static vipCasinoButtons() {
    const buttons = VIP_CASINOS.map(casino => 
      this.createButton(`vip_casino_${casino.id}`, casino.label, ButtonStyle.Primary, casino.emoji)
    );
    
    return this.createButtonRow(...buttons);
  }

  static vipTypeButtons() {
    return this.createButtonRow(
      this.createButton('vip_type_semanal', 'Semanal', ButtonStyle.Primary, EMOJIS.STAR),
      this.createButton('vip_type_leaderboard', 'Leaderboard', ButtonStyle.Success, EMOJIS.CROWN)
    );
  }

  static casinoSelectMenu(casinos) {
    const options = [
      {
        label: '— Selecionar Casino —',
        value: 'none',
        emoji: '❓',
        description: 'Escolha um casino da lista abaixo',
        default: true
      },
      ...Object.values(casinos).map(casino => ({
        label: casino.label,
        value: casino.id,
        emoji: casino.emoji || EMOJIS.CASINO,
        description: `Jogar em ${casino.label}`
      }))
    ];

    return new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('select_casino')
        .setPlaceholder('🎰 Selecione o seu casino preferido')
        .addOptions(options)
    );
  }

  static categoryButtons(staticCats, dynamicCats) {
    const rows = [];
    let currentRow = new ActionRowBuilder();

    // Add static categories
    for (const cat of staticCats) {
      if (currentRow.components.length === 5) {
        rows.push(currentRow);
        currentRow = new ActionRowBuilder();
      }

      currentRow.addComponents(
        this.createButton(
          `category_${cat.id}`,
          cat.label,
          this.styleMap[cat.color] || ButtonStyle.Secondary,
          cat.emoji
        )
      );
    }

    // Add dynamic categories (verificar se estão ativos)
    const dynamicEntries = Object.entries(dynamicCats);
    
    for (const [id, cat] of dynamicEntries) {
      if (!cat.active) {
        continue;
      }

      if (currentRow.components.length === 5) {
        rows.push(currentRow);
        currentRow = new ActionRowBuilder();
      }

      currentRow.addComponents(
        this.createButton(
          `category_${id}`,
          cat.name,
          this.styleMap[cat.color] || ButtonStyle.Secondary,
          cat.emoji
        )
      );
    }

    if (currentRow.components.length > 0) {
      rows.push(currentRow);
    }

    return rows;
  }

  static promoButtons(promos) {
    const rows = [];
    let currentRow = new ActionRowBuilder();

    for (const [pid, promo] of Object.entries(promos)) {
      if (!promo.active || Date.now() > new Date(promo.end)) {
        continue;
      }

      if (currentRow.components.length === 5) {
        rows.push(currentRow);
        currentRow = new ActionRowBuilder();
      }

      currentRow.addComponents(
        this.createButton(
          `gw_promo_${pid}`,
          promo.name,
          this.styleMap[promo.color] || ButtonStyle.Success,
          promo.emoji || EMOJIS.FIRE
        )
      );
    }

    if (currentRow.components.length > 0) {
      rows.push(currentRow);
    }

    return rows;
  }

  // === SUBMISSION BUTTONS ===
  static submissionButtons(channelId, ticketNumber) {
    return this.createButtonRow(
      this.createLinkButton(
        `https://discord.com/channels/@me/${channelId}`,
        `Ir para Ticket #${ticketNumber}`,
        '🎫'
      )
    );
  }

  // === MOD BUTTONS (apenas visíveis para mods) ===
  static modButtons(submissionId) {
    return this.createButtonRow(
      this.createButton(`mod_approve_${submissionId}`, 'Aprovar', ButtonStyle.Success, '✅'),
      this.createButton(`mod_reject_${submissionId}`, 'Não Aprovar', ButtonStyle.Danger, '❌')
    );
  }

  // === APPROVAL BUTTONS ===
  static approvalButtons(approvalId) {
    return this.createButtonRow(
      this.createButton(`approval_goto_${approvalId}`, 'Ir para Ticket', ButtonStyle.Primary, '🎫'),
      this.createButton(`approval_paid_${approvalId}`, 'Pago', ButtonStyle.Success, '💰'),
      this.createButton(`approval_review_${approvalId}`, 'Rever', ButtonStyle.Secondary, '🔍')
    );
  }

  // === SUPPORT COMPLETION BUTTON ===
  static supportCompletionButton(supportId) {
    return this.createButtonRow(
      this.createButton(`support_complete_${supportId}`, 'Marcar como Concluído', ButtonStyle.Success, '✅')
    );
  }

  // === REJECTION BUTTONS ===
  static rejectionButtons() {
    return this.resubmitButtons();
  }
}

module.exports = ComponentFactory;