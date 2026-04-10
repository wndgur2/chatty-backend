import { CronExpression } from '@nestjs/schedule';

/** How often the background job scans for chatrooms due for AI evaluation. */
export const AI_BACKGROUND_EVALUATION_CRON = CronExpression.EVERY_5_SECONDS;

/** Seconds before the first voluntary AI evaluation after a user message. */
export const INITIAL_AI_EVALUATION_DELAY_SECONDS = 4;
