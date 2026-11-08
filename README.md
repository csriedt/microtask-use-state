# microtaskUseState

A `useState`-shaped hook built on `queueMicrotask`, runnable outside React. It exists to make
microtasks concrete: where they run, what they defer, and what they cost.

Written in October 2025 while trying to understand the MDN microtask guide. Extracted from a
private project in 2026.

## What it does

Reads are synchronous and stale. Writes are staged and committed at the next microtask
checkpoint. Several writes in one tick collapse to the last one.

Three parts:

- a **staging variable**, written eagerly, so later calls in the same tick overwrite it
- a **flag**, so only the first call queues a commit
- a **single microtask**, which copies staged into committed

The getter is a function rather than a value because the value changes under you. A `get`
accessor would work, but a call is the honest signal that you're reading something which may
have moved.

## What it isn't

React doesn't store hook state in microtasks. Hook state lives on the fiber. What React does use
microtasks for is scheduling — automatic batching routes sync-lane work through a scheduled
flush. This emulates the *timing* you feel, not the mechanism underneath.

## What it costs

Microtasks can enqueue each other. A microtask that queues another runs before the task queue
gets a look in, and recursively that starves everything else: nothing renders, nothing responds,
and the page looks hung while the queue is busy doing nothing useful. MDN's guide carries a
warning about exactly this.

Ordering is the other trap. Any promise or `await` nearby interleaves with your commit, so where
your value lands isn't always where you assumed.

The docs take a position on it themselves:

> As such, you should typically use microtasks only when there's no other solution, or when
> creating frameworks or libraries that need to use microtasks in order to create the
> functionality they're implementing.

This is a teaching device, not a pattern to ship.

## Running it

One file, no dependencies.

    npx tsx microtaskUseState.ts

Expected output:

    0
    2

The first is the read taken before the tick. The second is the same read after the commit.

## Related

The write-up is at <https://chrisriedt.com/projects/microtask-use-state/>.

## Licence

MIT.
