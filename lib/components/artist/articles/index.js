/* @flow */
'use strict';

import Relay from 'react-relay';
import React from 'react-native';
const { ScrollView, StyleSheet, View } = React;

import colors from '../../../../data/colors';
import Separator from '../../separator'
import SerifText from '../../text/serif';
import ImageView from '../../opaque_image_view';
import Article from './article';

class Articles extends React.Component {
  render() {
    const articles = this.props.articles;
    return (
      <View style={styles.container}>
        <Separator/>
        <SerifText style={styles.heading}>Featured Articles</SerifText>
        <ScrollView horizontal={true} style={{ overflow: 'visible', marginBottom:40 }}>
          { articles.map(article => <Article key={article.id} article={article} />) }
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  heading: {
    marginBottom: 20,
    fontSize: 20,
  }
});

export default Relay.createContainer(Articles, {
  fragments: {
    articles: () => Relay.QL`
      fragment on Article @relay(plural: true) {
          id
          ${Article.getFragment('article')}
      }
    `,
  }
});