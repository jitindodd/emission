import moment from "moment"
import React from "react"
import { NavigatorIOS, View } from "react-native"
import { createFragmentContainer, graphql } from "react-relay"

import SwitchBoard from "lib/NativeModules/SwitchBoard"

import { Flex } from "../Elements/Flex"
import { Icon20 } from "../Elements/Icon"
import { Sans12 } from "../Elements/Typography"

import { BiddingThemeProvider } from "../Components/BiddingThemeProvider"
import { BidGhostButton, Button } from "../Components/Button"
import { Container } from "../Components/Containers"
import { MarkdownRenderer } from "../Components/MarkdownRenderer"
import { Timer } from "../Components/Timer"
import { Title } from "../Components/Title"

import { BidResult_sale_artwork } from "__generated__/BidResult_sale_artwork.graphql"

const SHOW_TIMER_STATUSES = ["WINNING", "OUTBID", "RESERVE_NOT_MET"]

interface Bid {
  display: string
  cents: number
}

interface BidResultProps {
  sale_artwork: BidResult_sale_artwork
  bid: Bid
  status: string
  title: string
  description: string
  suggestedNextBid: Bid
  navigator: NavigatorIOS
}

export class BidResult extends React.Component<BidResultProps> {
  onPressBidAgain() {
    this.props.navigator.popToTop()
  }

  async exitBidFlow(status: string, saleId: string) {
    await SwitchBoard.dismissModalViewController(this)

    if (status === "LIVE_BIDDING_STARTED") {
      SwitchBoard.presentModalViewController(this, `/auction/${saleId}`)
    }
  }

  render() {
    const { status } = this.props
    const { id, live_start_at, end_at } = this.props.sale_artwork.sale

    let nextBid
    if (this.props.suggestedNextBid) {
      // when bidder position is created and the suggested_next_bid is passed from prev screen
      nextBid = this.props.suggestedNextBid.display
    } else {
      // otherwise (when MP returns OUTBID without creating BP, when it already knows there are higher bids) select minimum_next_bid
      nextBid = nextBid = this.props.sale_artwork.minimum_next_bid.display
    }

    const bidAgain = SHOW_TIMER_STATUSES.indexOf(this.props.status) > -1
    const buttonMsg = bidAgain ? `Bid ${nextBid} or more` : "Continue"

    return (
      <BiddingThemeProvider>
        <Container mt={6}>
          <View>
            <Flex alignItems="center">
              <Icon20 source={require("../../../../../images/circle-x-red.png")} />
              <Title m={4}>{this.props.title}</Title>
              <MarkdownRenderer>{this.props.description}</MarkdownRenderer>
              {bidAgain && <TimeLeftToBidDisplay liveStartsAt={live_start_at} endAt={end_at} />}
            </Flex>
          </View>
          {bidAgain ? (
            <Button text={buttonMsg} onPress={() => this.onPressBidAgain()} />
          ) : (
            <BidGhostButton text="Continue" onPress={() => this.exitBidFlow(status, id)} />
          )}
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