import { expect, test } from '@playwright/test';

test('find speed', async ({ page }) => {
    await page.goto('https://play.elevatorsaga.com/#challenge=1');
    await page.waitForLoadState();
    const increaseButton = page.locator('h3.right i.timescale_increase');
    const speedDisplay = page.locator('h3.right i.timescale_decrease + span');
    expect(speedDisplay).toHaveText(/^[0-9]*x$/);
    const speed = parseInt(await speedDisplay.innerText(), 10);
});
