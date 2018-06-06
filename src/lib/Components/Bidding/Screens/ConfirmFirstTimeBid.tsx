import React from "react"
import { View } from "react-native"
import { commitMutation, createFragmentContainer, graphql } from "react-relay"
import styled from "styled-components/native"

import { Schema, screenTrack, track } from "../../../utils/track"

import { Flex } from "../Elements/Flex"
import { Serif14, SerifItalic14, SerifSemibold14, SerifSemibold18 } from "../Elements/Typography"

import { BiddingThemeProvider } from "../Components/BiddingThemeProvider"
import { BidInfoRow } from "../Components/BidInfoRow"
import { Button } from "../Components/Button"
import { Checkbox } from "../Components/Checkbox"
import { Container } from "../Components/Containers"
import { Divider } from "../Components/Divider"
import { Timer } from "../Components/Timer"
import { Title } from "../Components/Title"

import SwitchBoard from "lib/NativeModules/SwitchBoard"

import { BillingAddress } from "./BillingAddress"
import {Bid, bidderPositionMutation, ConfirmBidProps} from "./ConfirmBid"

import { Colors } from "lib/data/colors"
import {PayloadError} from "relay-runtime";
import {metaphysics} from "../../../metaphysics";
import {BidResultScreen} from "./BidResult";
// import stripe from "tipsi-stripe"

// stripe.setOptions({
//   publishableKey: "fill me in",
//   // merchantId: "MERCHANT_ID", // Optional
//   // androidPayMode: "test", // Android only
// })

export interface Address {
  fullName: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  postalCode: string
}

interface ConformBidState {
  billingAddress?: Address
  creditCardToken?: StripeToken // TODO: change this interface accrodingly when adapting stripe
  conditionsOfSaleChecked: boolean
  isLoading: boolean
}

export interface StripeToken {
  tokenId: string
  created: number
  livemode: 1 | 0
  card: any
  bankAccount: any
  extra: any
}

const theme = {
  primaryBackgroundColor: Colors.White,
  secondaryBackgroundColor: Colors.GrayLight,
  primaryForegroundColor: Colors.GrayBold,
  secondaryForegroundColor: Colors.GrayRegular,
  accentColor: Colors.PurpleRegular,
  errorColor: Colors.RedRegular,
}

const creditCardMutation = graphql`
  mutation ConfirmFirstTimeBidMutation($input: creditCardInput!) {
    createCreditCard(input: { token: "tok_1CZlngGK3Gnpfa3OFTmW5nBd" }) {
      credit_card {
        id
        brand
        name
        last_digits
        expiration_month
        expiration_year
      }
    }
  }
`

const MAX_POLL_ATTEMPTS = 20

@screenTrack({
  context_screen: Schema.PageNames.BidFlowConfirmBidPage,
  context_screen_owner_type: null,
})
export class ConfirmFirstTimeBid extends React.Component<ConfirmBidProps, ConformBidState> {
  state = {
    billingAddress: undefined,
    creditCardToken: null,
    conditionsOfSaleChecked: false,
    isLoading: false,
  }

  private pollCount = 0

  onPressConditionsOfSale = () => {
    SwitchBoard.presentModalViewController(this, "/conditions-of-sale?present_modally=true")
  }

  showBillingAddressForm() {
    this.props.navigator.push({
      component: BillingAddress,
      title: "",
      passProps: {
        onSubmit: this.onBillingAddressAdded,
        billingAddress: this.state.billingAddress,
        navigator: this.props.navigator,
      },
    })
  }

  onBillingAddressAdded = (values: Address) => {
    this.setState({ billingAddress: values })
  }

  // Show stripe's complete card form- this does not use CreditCardForm.tsx at all
  awaitTokenFromCreditCardForm = async () => {
    // const token = await stripe.paymentRequestWithCardForm({ theme })
    // console.log("GOT TOKEN", token)
    // this.setState({ creditCardToken: token })
  }

  @track({
    action_type: Schema.ActionTypes.Tap,
    action_name: Schema.ActionNames.BidFlowPlaceBid,
  })
  createCreditCard() {
    commitMutation(this.props.relay.environment, {
      onCompleted: () => this.createBidderPosition(),
      onError: e => console.error(e, e.message),
      mutation: creditCardMutation,
      variables: {
        input: {
          token: this.state.creditCardToken.tokenId
        },
      },
    })
  }

  createBidderPosition() {
    commitMutation(this.props.relay.environment, {
      onCompleted: (results, errors) => this.verifyBidPosition(results, errors),
      onError: e => console.error(e, e.message),
      mutation: bidderPositionMutation,
      variables: {
        input: {
          sale_id: this.props.sale_artwork.sale.id,
          artwork_id: this.props.sale_artwork.artwork.id,
          max_bid_amount_cents: this.props.bid.cents,
        },
      },
    })
  }

  verifyBidPosition(results: any, errors: PayloadError[] | null | undefined) {
    const status = results.createBidderPosition.result.status

    if (!errors && status === "SUCCESS") {
      this.bidPlacedSuccessfully(results)
    } else {
      // TODO: implement error screen
    }
  }

  @track({
    action_type: Schema.ActionTypes.Success,
    action_name: Schema.ActionNames.BidFlowPlaceBid,
  })
  bidPlacedSuccessfully(results) {
    const positionId = results.createBidderPosition.result.position.id
    this.queryForBidPosition(positionId).then(this.checkBidPosition.bind(this))
  }

  queryForBidPosition(bidderPositionID: string) {
    return metaphysics({
      query: `
        {
          me {
            bidder_position(id: "${bidderPositionID}") {
              status
              message_header
              message_description_md
              position {
                id
                processed_at
                is_active
                suggested_next_bid {
                  cents
                  display
                }
              }
            }
          }
        }
      `
    })
  }

  checkBidPosition(result) {
    const bidderPosition = result.data.me.bidder_position.position
    console.log(result.data.me.bidder_position)
    const status = result.data.me.bidder_position.status

    // console.log(result.data.me.bidder_position)
    if (status === "WINNING") {
      this.showBidResult(true, "WINNING")
    } else if (status === "PENDING") {
      setTimeout(() => this.queryForBidPosition(bidderPosition.id).then(this.checkBidPosition.bind(this)), 1000)
    } else {
      // TODO: implement this later.
    }
  }

  showBidResult(winning: boolean, status: string, messageHeader?: string, messageDescriptionMd?: string, suggestedNextBid?: Bid) {
    this.props.navigator.push({
      component: BidResultScreen,
      title: "",
      passProps: {
        sale_artwork: this.props.sale_artwork,
        status,
        message_header: messageHeader,
        message_description_md: messageDescriptionMd,
        winning,
        bid: this.props.bid,
        suggested_next_bid: suggestedNextBid,
      },
    })
  }

  conditionsOfSalePressed() {
    this.setState({ conditionsOfSaleChecked: !this.state.conditionsOfSaleChecked })
  }

  maxBidPressed() {
    this.props.navigator.pop()
  }

  render() {
    const { billingAddress, creditCardToken: token } = this.state

    return (
      <BiddingThemeProvider>
        <Container m={0}>
          <Flex alignItems="center">
            <Title mb={3}>Confirm your bid</Title>
            <Timer timeLeftInMilliseconds={1000 * 60 * 20} />
          </Flex>

          <View>
            <Flex m={4} mt={0} alignItems="center">
              <SerifSemibold18>{this.props.sale_artwork.artwork.artist_names}</SerifSemibold18>
              <SerifSemibold14>Lot {this.props.sale_artwork.lot_label}</SerifSemibold14>

              <SerifItalic14 color="black60">
                {this.props.sale_artwork.artwork.title}, <Serif14>{this.props.sale_artwork.artwork.date}</Serif14>
              </SerifItalic14>
            </Flex>

            <Divider mb={2} />

            <BidInfoRow label="Max bid" value={this.props.bid.display} onPress={() => this.maxBidPressed()} />

            <Divider mb={2} />

            <BidInfoRow label="Credit card" value={token && token.tokenId} onPress={() => this.awaitTokenFromCreditCardForm()} />

            <Divider mb={2} />

            <BidInfoRow label="Billing address" value={billingAddress && this.formatAddress(billingAddress)} onPress={() => this.showBillingAddressForm()} />

            <Divider />
          </View>

          <View>
            <Checkbox justifyContent="center" onPress={() => this.conditionsOfSalePressed()}>
              <Serif14 mt={2} color="black60">
                You agree to <LinkText onPress={this.onPressConditionsOfSale}>Conditions of Sale</LinkText>.
              </Serif14>
            </Checkbox>

            <Flex m={4}>
              <Button text="Place Bid" onPress={() => this.createCreditCard()} />
            </Flex>
          </View>
        </Container>
      </BiddingThemeProvider>
    )
  }

  private formatAddress(address: Address) {
    return [address.addressLine1, address.addressLine2, address.city, address.state].filter(el => el).join(" ")
  }
}

const LinkText = styled.Text`
  text-decoration-line: underline;
`

export const ConfirmFirstTimeBidScreen = createFragmentContainer(
  ConfirmFirstTimeBid,
  graphql`
    fragment ConfirmFirstTimeBid_sale_artwork on SaleArtwork {
      sale {
        id
      }
      artwork {
        id
        title
        date
        artist_names
      }
      lot_label
      ...BidResult_sale_artwork
    }
  `
)
