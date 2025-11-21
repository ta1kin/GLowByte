import { Action, Command, Ctx, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { BotService } from './bot.service';

@Update()
export class BotUpdate {
  constructor(private readonly botService: BotService) {}

  @Command('start')
  async onStart(@Ctx() ctx: Context) {
    await this.botService.start(ctx);
  }

  @Action('predictions')
  async onPredictions(@Ctx() ctx: Context) {
    await this.botService.showPredictions(ctx);
  }

  @Action('critical_risks')
  async onCriticalRisks(@Ctx() ctx: Context) {
    await this.botService.showCriticalRisks(ctx);
  }

  @Action('help')
  async onHelp(@Ctx() ctx: Context) {
    await this.botService.showHelp(ctx);
  }

  @Action('back_to_main')
  async onBackToMain(@Ctx() ctx: Context) {
    await this.botService.backToMain(ctx);
  }
}

