# Security Policy

## Supported Versions

This package is published from `main`. Security fixes are released against the latest version on npm. Older versions are not patched.

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Report vulnerabilities privately via GitHub's [private vulnerability reporting](https://github.com/TightknitAI/block-kit-builder/security/advisories/new). This routes directly to the maintainers and is not publicly visible.

Include:

- A description of the issue and the impact
- Steps to reproduce (a minimal repro, proof-of-concept, or affected code path)
- The affected version(s)
- Any suggested mitigation, if known

You should receive an acknowledgement within 5 business days. We will keep you informed as we investigate and prepare a fix. Once a patch is released, we will publish a GitHub Security Advisory crediting the reporter unless anonymity is requested.

## Scope

In scope:

- The `@tightknitai/block-kit-builder` package and its build output
- Code in this repository (`src/`, build configuration)

Out of scope:

- Vulnerabilities in upstream dependencies — please report those to the respective projects. We track dependency advisories via Dependabot and update accordingly.
- Issues in the consuming application's backend, OAuth flow, or Slack token handling — those are the consumer's responsibility (see the README boundary section).
