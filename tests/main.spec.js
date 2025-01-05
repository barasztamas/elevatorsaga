import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import { rootPath } from '../path';

const scriptTexts = {};
const runSpeed = 20;
const levelNumbers = Array.from({ length: 2 }, (_, i) => i + 1);

test.beforeAll('readScript', async () => {
    scriptTexts.default = fs.readFileSync(`${rootPath}/solutions/default.js`, 'utf8');
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
        await pushTextWithBrackets(scriptTexts.default, codeboxEnd);
        await page.getByRole('button', { name: 'Apply' }).click();
        await page.waitForLoadState();
        const errorBlock = page.locator('div.container > div.codestatus > h5.error');
        if ((await errorBlock.evaluate((e) => window.getComputedStyle(e).getPropertyValue('display'))) !== 'none') {
            await test.info().attach('error', { body: await errorBlock.textContent() });
            throw 'Syntax error in code';
        }
        expect(errorBlock).toHaveCSS('display', 'none', { timeout: 10 });
    });
});

async function pushTextWithBrackets(text = '', locator, brackets = '{([') {
    if (brackets.length === 0) {
        await locator.pressSequentially(text);
        return;
    }
    const chunks = text.split(brackets[0]);
    for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        await pushTextWithBrackets(chunk, locator, brackets.slice(1));
        if (i < chunks.length - 1) {
            await locator.press(brackets[0]);
            await locator.press('Delete');
        }
    }
}
