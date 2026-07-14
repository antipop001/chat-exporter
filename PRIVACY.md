# Privacy Policy — Chat Exporter

**Last updated:** 2026-07-14

## Summary

Chat Exporter does not collect, transmit, store, or share any user data. Everything
the extension reads stays on your own computer. The developer receives nothing.

## What the extension handles

When you click the extension's toolbar button and choose an export direction, the
extension reads the visible text of the conversation on the tab you are currently
viewing. That text may include **website content** and **personal communications**
(for example, chat messages), because that text is precisely what you have asked the
extension to export.

This text is used for one thing only: writing the `.txt` file that you requested. The
file is saved to your own Downloads folder by your own browser.

## What the extension does NOT do

- It does **not** send any data to the developer, to any server, or to any third party.
- It makes **no network requests of any kind**. The extension contains no code that
  contacts a remote host.
- It does **not** include analytics, telemetry, tracking, or advertising.
- It does **not** sell or transfer data to third parties.
- It does **not** use data to determine creditworthiness or for lending purposes.
- It does **not** store data anywhere outside the file it downloads for you.
- It does **not** run in the background, and it has no access to any page until you
  explicitly click the button on that page.

## Permissions and why they are needed

- **activeTab** — grants temporary access to the single tab you are viewing, and only
  after you click the extension's button. The extension requests no host permissions,
  so it cannot access any site unless you deliberately invoke it there.
- **scripting** — used solely to inject the extension's own bundled script into that
  tab so it can scroll the conversation and read the visible text. Nothing is injected
  until you click Export.
- **downloads** — used solely to save the resulting `.txt` file to your Downloads
  folder, only in response to your click.

## Remote code

The extension executes no remotely hosted code. All code is bundled inside the
extension package and is visible in the public source repository.

## Data retention

The extension retains nothing. The only artifact it produces is the `.txt` file it
downloads to your device, which is yours and under your control.

## Source code

Chat Exporter is open source. You can read every line of it here:
https://github.com/antipop001/chat-exporter

## Changes to this policy

Any changes to this policy will be published in this file in the repository above,
with an updated "Last updated" date.

## Contact

Questions or concerns can be raised as an issue on the repository:
https://github.com/antipop001/chat-exporter/issues
