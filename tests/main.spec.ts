import { expect, Locator, test } from '@playwright/test';
import fs from 'node:fs';
import { rootPath } from '../path';

const scriptTexts: { [key: string]: string } = {};
const scriptTextArrays: { [key: string]: string[] } = {};
const runSpeed = 20;
const levelNumbers = Array.from({ length: 5 }, (_, i) => i + 1);

test.beforeAll('readScript', async () => {
    scriptTexts.default = fs.readFileSync(`${rootPath}/solutions/default.js`, 'utf8');
    scriptTextArrays.default = scriptTexts.default.split('\n');
});

test.beforeEach('setSpeed', async ({ page }) => {
    await page.goto('/');
    const speedSection = page.locator('div.container > div.challenge > h3.right');
    const increaseButton = speedSection.locator('i.timescale_increase');
    const speedDisplay = speedSection.locator('span.emphasis-color');
    await expect(speedDisplay).toHaveText(/^[0-9]+x$/);
    while (parseInt(await speedDisplay.innerText(), 10) < runSpeed) {
        await increaseButton.click();
        await expect(speedDisplay).toHaveText(/^[0-9]*x$/);
    }
});

levelNumbers.forEach((level) => {
    test(`level ${level}`, async ({ page }) => {
        test.setTimeout(5 * 60 * 1000);
        await page.goto(`/#challenge=${level}`);
        const codebox = page.locator('div.CodeMirror-code > div > pre > span');
        const codeboxEnd = codebox.last();
        await codeboxEnd.click();
        await codeboxEnd.press('ControlOrMeta+a');
        await codeboxEnd.press('Delete');
        await pushCodeToCodeBox(scriptTextArrays.default, codeboxEnd);
        await page.getByRole('button', { name: 'Apply' }).click();
        await page.waitForLoadState();
        const errorBlock = page.locator('div.container > div.codestatus > h5.error');
        if ((await errorBlock.evaluate((e) => window.getComputedStyle(e).getPropertyValue('display'))) !== 'none') {
            await test.info().attach('code', { body: (await codebox.allTextContents()).join('\n') });
            await test.info().attach('error', { body: (await errorBlock.textContent()) ?? undefined });
        }
        expect(errorBlock, 'Syntax error in code').toHaveCSS('display', 'none', { timeout: 10 });
        const feedback = page.locator('div.container > div.world > div.feedbackcontainer > div.feedback');
        expect(feedback, 'Failed level').toContainText('Success!');
    });
});

async function pushCodeToCodeBox(textArray: string[], locator: Locator) {
    for (const line of textArray) {
        await locator.press('Shift+Home');
        await locator.press('Delete');
        await pushLineWithBrackets(line, locator);
    }
}

async function pushLineWithBrackets(line = '', locator: Locator, brackets = '{([') {
    if (brackets.length === 0) {
        await locator.pressSequentially(line);
        return;
    }
    const actualBracket = brackets[0];
    const furtherBrackets = brackets.slice(1);
    const chunks = line.split(actualBracket);
    for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        await pushLineWithBrackets(chunk, locator, furtherBrackets);
        if (i < chunks.length - 1) {
            await locator.press(actualBracket);
            await locator.press('Delete');
        }
    }
}
