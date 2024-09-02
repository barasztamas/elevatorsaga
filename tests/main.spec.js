import { expect, test } from '@playwright/test';
import { copy } from 'copy-paste';
import fs from 'node:fs';
import { rootPath } from '../path';

const scriptTexts = {};
test.beforeAll(async () => {
    scriptTexts.default = fs.readFileSync(`${rootPath}/solutions/default.js`, 'utf8');
    copy(scriptTexts.default);
});

test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const speedSection = page.locator('div.container > div.challenge > h3.right');
    const increaseButton = speedSection.locator('i.timescale_increase');
    const speedDisplay = speedSection.locator('span.emphasis-color');
    await expect(speedDisplay).toHaveText(/^[0-9]+x$/);
    while (parseInt(await speedDisplay.innerText(), 10) < 20) {
        await increaseButton.click();
        await expect(speedDisplay).toHaveText(/^[0-9]*x$/);
    }
});

Array.from({ length: 2 }, (_, i) => i + 1).forEach((level) => {
    test(`level ${level}`, async ({ page }) => {
        await page.goto(`/#challenge=${level}`);
        const codebox = page.locator('div.CodeMirror-code > div > pre > span').first();
        await codebox.click();
        await codebox.press('ControlOrMeta+a');
        await codebox.press('ControlOrMeta+v');
        await page.getByRole('button', { name: 'Apply' }).click();
        await page.waitForLoadState();
        const errorBlock = page.locator('div.container > div.codestatus > h5.error');
        await expect(errorBlock).toHaveText(/^ There is a problem with your code: $/);
    });
});
