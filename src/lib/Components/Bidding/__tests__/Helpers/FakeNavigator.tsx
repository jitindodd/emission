import React from "react"
import { Route } from "react-native"
import * as renderer from "react-test-renderer"

export class FakeNavigator {
  private stack: Route[] = []

  push(route: Route) {
    this.stack.push(route)
  }

  pop() {
    this.stack.pop()
  }

  popN(n: number) {
    for (let count = 0; count++; count < n) {
      this.stack.pop()
    }
  }

  mostRecentRoute(): Route {
    return this.stack[this.stack.length - 1]
  }

  nextStep() {
    const currentRoute = this.mostRecentRoute()

    return renderer.create(
      React.createElement(currentRoute.component, {
        ...currentRoute.passProps,
        navigator: this,
        relay: {
          environment: null,
        },
      })
    )
  }

  clear() {
    this.stack = []
  }
}
