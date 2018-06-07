import moment from "moment"
import React from "react"
import { NavigatorIOS, View } from "react-native"

import SwitchBoard from "lib/NativeModules/SwitchBoard"

import { Flex } from "../Elements/Flex"
import { Icon20 } from "../Elements/Icon"
import { Sans12 } from "../Elements/Typography"

import { BiddingThemeProvider } from "../Components/BiddingThemeProvider"
import { BidGhostButton } from "../Components/Button"
import { Container } from "../Components/Containers"
import { Timer } from "../Components/Timer"
import { Title } from "../Components/Title"

import { BidResult_sale_artwork } from "__generated__/BidResult_sale_artwork.graphql"

interface Bid {
  display: string
  cents: number
}

interface BidResultProps {
  sale_artwork: BidResult_sale_artwork
  bid: Bid
  status: string
  navigator: NavigatorIOS
}

export class WiningBidResult extends React.Component<BidResultProps> {
  async exitBidFlow() {
    await SwitchBoard.dismissModalViewController(this)

    if (this.props.status === "LIVE_BIDDING_STARTED") {
      SwitchBoard.presentModalViewController(this, `/auction/${this.props.sale_artwork.sale.id}`)
    }
  }

  render() {
    // non-live sale doesn't have live_start_at so bidding is open until end time
    const { live_start_at, end_at } = this.props.sale_artwork.sale

    return (
      <BiddingThemeProvider>
        <Container mt={6}>
          <View>
            <Flex alignItems="center">
              <Icon20 source={require("../../../../../images/circle-check-green.png")} />
              <Title m={4}>You're the highest bidder</Title>
              <TimeLeftToBidDisplay liveStartsAt={live_start_at} endAt={end_at} />
            </Flex>
          </View>
          <BidGhostButton text="Continue" onPress={() => this.exitBidFlow()} />
        </Container>
      </BiddingThemeProvider>
    )
  }
}

interface TimeLeftToBidDisplayProps {
  liveStartsAt: string
  endAt: string
}

const TimeLeftToBidDisplay: React.SFC<TimeLeftToBidDisplayProps> = props => {
  const { liveStartsAt, endAt } = props
  const timeLeftToBid = liveStartsAt || endAt
  const timeLeftToBidMillis = Date.parse(timeLeftToBid) - Date.now()
  const endOrLive = liveStartsAt ? "Live " : "Ends "

  return (
    <Flex alignItems="center">
      <Sans12>
        {endOrLive} {moment(timeLeftToBid, "YYYY-MM-DDTHH:mm:ss+-HH:mm").format("MMM D, ha")}
      </Sans12>
      <Timer timeLeftInMilliseconds={timeLeftToBidMillis} />
    </Flex>
  )
}
