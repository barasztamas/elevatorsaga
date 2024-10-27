import { expect, test } from '@playwright/test';
import { copy } from 'copy-paste';
import fs from 'node:fs';
import { rootPath } from '../path';
import { platform } from 'node:process';

const scriptTexts = {};
const runSpeed = 20;
const levelNumbers = Array.from({ length: 2 }, (_, i) => i + 1);

test.beforeAll('readScript', async () => {
    scriptTexts.default = fs.readFileSync(`${rootPath}/solutions/default.js`, 'utf8');
    copy(scriptTexts.default);
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
        await page.goto(`/#challenge=${level}`);
        const codebox = page.locator('div.CodeMirror-code > div > pre > span').first();
        await codebox.click();
        await codebox.press('ControlOrMeta+a');
        await codebox.press(`${platform === 'linux' ? 'Shift+' : ''}ControlOrMeta+v`);
        await page.getByRole('button', { name: 'Apply' }).click();
        await page.waitForLoadState();
        const errorBlock = page.locator('div.container > div.codestatus > h5.error');
        await expect(errorBlock).toHaveText(/^ There is a problem with your code: $/);
    });
});
