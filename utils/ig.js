const axios = require('axios');
const https = require('https');
const cookie = 'csrftoken=fr_UWlSf6U4TtBLH4JD_kz; datr=JPdeZxT4QY04bjPocujctVTS; ds_user_id=71016272280; ig_did=ED4EA9E7-69A5-4276-B190-133470AF4B7D; ig_direct_region_hint="CLN\05471016272280\0541765817636:01f70031e7ae39994efa6587da4cca42440e2cbbff982cce9f97dbf6bffde4bac9fbb760"; ig_nrcb=1; mid=Z173JAALAAFTa0p9_pnOEwe4GjJm; ps_l=1; ps_n=1; sessionid=71016272280%3ABBwOyLNo4nTw7H%3A20%3AAYe5k1w1xwTrW1N4Ot1W_pSmRiV3Mdcw3Bj72x9l9w; wd=1368x641; rur="CCO\05471016272280\0541766219296:01f79ab060c9c90befc5ec9c0003f39f13e3cf5a16a6b730b4de7aabd3cc5700ce004eef"; csrftoken=fr_UWlSf6U4TtBLH4JD_kz; ds_user_id=71016272280; wd=1368x641; rur="CCO\05471016272280\0541766222846:01f74cac2b524966767fe069c84483889de7eed333cba22840f1a4965805be2980a561b7"; useragent=TW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzEzMS4wLjAuMCBTYWZhcmkvNTM3LjM2; _uafec=Mozilla%2F5.0%20(Windows%20NT%2010.0%3B%20Win64%3B%20x64)%20AppleWebKit%2F537.36%20(KHTML%2C%20like%20Gecko)%20Chrome%2F131.0.0.0%20Safari%2F537.36;';

async function igDl(link) {
 function formatNumber(number) {
    if (isNaN(number)) {
        return null;
     }
      return number.toLocaleString('de-DE');
  }
  async function getPost(url, cookie) {
  const headers = {
  "accept": "*/*",
  "accept-language": "vi,en-US;q=0.9,en;q=0.8",
  "sec-ch-ua": "\"Chromium\";v=\"106\", \"Microsoft Edge\";v=\"106\", \"Not;A=Brand\";v=\"99\"",
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": "\"Windows\"",
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "same-site",
  "x-asbd-id": "198387",
  "x-csrftoken": "tJk2tDhaeYfUeJRImgbH75Vp6CV6PjtW",
  "x-ig-app-id": "936619743392459",
  "x-ig-www-claim": "hmac.AR1NFmgjJtkM68KRAAwpbEV2G73bqDP45PvNfY8stbZcFiRA",
  "x-instagram-ajax": "1006400422",
  "Referer": "https://www.instagram.com/",
  "Referrer-Policy": "strict-origin-when-cross-origin"
};
  if (!url || !url.match(/https:\/\/www\.instagram\.com\/(p|tv|reel)\/[a-zA-Z0-9]+/)) {
    throw new Error("Invalid or missing URL");
  }
  headers.cookie = cookie;
  const { data } = await axios.get(url, { headers });
  const postId = data.match(/instagram:\/\/media\?id=(\d+)/)?.[1];
  if (!postId) throw new Error("Post not found");
  const { data: postInfo } = await axios.get(`https://www.instagram.com/api/v1/media/${postId}/info/`, { headers });
  delete headers.cookie;
  const info = postInfo.items?.[0] || {};
  const dataReturn = {
    images: [],
    videos: []
  };
  if (info.video_versions) {
    dataReturn.videos = [info.video_versions[info.video_versions.length - 1].url];
  } else {
    const allImage = info.carousel_media || [{ image_versions2: info.image_versions2 }];
    dataReturn.images = allImage.map(item => item.image_versions2.candidates[0].url);
  }
  const postData = {
    ...dataReturn,
    caption: info.caption?.text || "",
    owner: {
      id: info.user.pk,
      username: info.user.username,
      full_name: info.user.full_name,
      profile_pic_url: info.user.profile_pic_url
    },
    like_count: info.like_count,
    comment_count: info.comment_count,
    created_at: info.taken_at,
    media_type: info.media_type,
    originalData: info
  };
   const attachments = [];
   if (postData.images && postData.images.length > 0) {
          attachments.push(...postData.images.map(imageUrl => ({
                type: "Photo",
                url: imageUrl
            })));
       } else if (postData.videos && postData.videos.length > 0) {
          attachments.push(...postData.videos.map(videoUrl => ({
                type: "Video",
                url: videoUrl
             })));
         }
  return {
       id: postData.originalData.id,
       message: postData?.caption || null,
       author: postData ? `${postData.owner.full_name} (${postData.owner.username})` : null,
       like: formatNumber(postData?.like_count) || null,
       comment: formatNumber(postData?.comment_count) || null,
       play: formatNumber(postData.originalData.play_count) || null,
       attachments
    };
}
async function getStories(url, cookie) {
  const headers = {
  "accept": "*/*",
  "accept-language": "vi,en-US;q=0.9,en;q=0.8",
  "sec-ch-ua": "\"Chromium\";v=\"106\", \"Microsoft Edge\";v=\"106\", \"Not;A=Brand\";v=\"99\"",
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": "\"Windows\"",
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "same-site",
  "x-asbd-id": "198387",
  "x-csrftoken": "tJk2tDhaeYfUeJRImgbH75Vp6CV6PjtW",
  "x-ig-app-id": "936619743392459",
  "x-ig-www-claim": "hmac.AR1NFmgjJtkM68KRAAwpbEV2G73bqDP45PvNfY8stbZcFiRA",
  "x-instagram-ajax": "1006400422",
  "referer": "https://www.instagram.com/",
  "referrer-policy": "strict-origin-when-cross-origin",
  'x-ig-app-id': '936619743392459',
  'x-ig-www-claim': 'hmac.AR2zPqOnGfYtujT0tmDsmiq0fdQ3f9DN4xXJ-J3EXnE6vFfA',
  'x-instagram-ajax-c2': 'b9a1aaad95e9',
  'x-instagram-ajax-c2-t': '41e3f8b',
  'x-requested-with': 'XMLHttpRequest'
};
  headers.cookie = cookie;
  async function getUserId(username) {
  const userRes = await axios.get(`https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`, { headers });
     return userRes.data.data.user.id;
  }
  const username = url.match(/instagram\.com\/stories\/([^/]+)\//)?.[1] || null;
  const userId = await getUserId(username);
  const getId = url.match(/\/stories\/[^\/]+\/(\d+)/)?.[1] || null;
  const storiesRes = await axios.get(`https://www.instagram.com/graphql/query/?query_hash=de8017ee0a7c9c45ec4260733d81ea31&variables={"reel_ids":["${userId}"],"tag_names":[],"location_ids":[],"highlight_reel_ids":[],"precomposed_overlay":false,"show_story_viewer_list":true}`, { headers });
  delete headers.cookie;
  const data = storiesRes.data.data.reels_media[0].items;
  const res = data.find(item => item.id === getId);
  let attachments = [];
    if (res.video_resources && res.video_resources.length > 0) {
      attachments.push({
        type: "Video",
        url: res.video_resources[0].src
      });
    } else if (res.display_resources && res.display_resources.length > 0) {
      attachments.push({
        type: "Photo",
        url: res.display_resources[0].src
      });
    }
    return {
       id: res.id,
       message: null,
       author: null,
       like: null,
       comment: null,
       play: null,
       attachments
    };
}
async function getHighlight(url, cookie) {
  try {
    const headers = {
      "accept": "*/*",
      "accept-language": "vi,en-US;q=0.9,en;q=0.8",
      "sec-ch-ua": "\"Chromium\";v=\"106\", \"Microsoft Edge\";v=\"106\", \"Not;A=Brand\";v=\"99\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"Windows\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-site",
      "x-asbd-id": "198387",
      "x-csrftoken": "tJk2tDhaeYfUeJRImgbH75Vp6CV6PjtW",
      "x-ig-app-id": "936619743392459",
      "x-ig-www-claim": "hmac.AR1NFmgjJtkM68KRAAwpbEV2G73bqDP45PvNfY8stbZcFiRA",
      "x-instagram-ajax": "1006400422",
      "referer": "https://www.instagram.com/",
      "referrer-policy": "strict-origin-when-cross-origin",
      'x-ig-app-id': '936619743392459',
      'x-ig-www-claim': 'hmac.AR2zPqOnGfYtujT0tmDsmiq0fdQ3f9DN4xXJ-J3EXnE6vFfA',
      'x-instagram-ajax-c2': 'b9a1aaad95e9',
      'x-instagram-ajax-c2-t': '41e3f8b',
      'x-requested-with': 'XMLHttpRequest',
    };
    const storyId = url.match(/story_media_id=([^&]+)/)?.[1];
    headers.cookie = cookie;
    const res = await axios.get(`https://i.instagram.com/api/v1/media/${storyId}/info/`,  { headers });
    delete headers.cookie;
    const data = res.data.items;
    const resp = data.find(item => item.id === storyId);
    let attachments = [];
    if (resp.video_versions && resp.video_versions.length > 0) {
      attachments.push({
        type: "Video",
        url: resp.video_versions[0].url
      });
    } else if (resp.image_versions2 && resp.image_versions2.candidates && resp.image_versions2.candidates.length > 0) {
      attachments.push({
        type: "Photo",
        url: resp.image_versions2.candidates[0].url
      });
    }
    return {
      id: resp.id,
      message: resp.caption,
      author: `${resp.user.full_name} (${resp.user.username})`,
      like: null,
      comment: null,
      play: null,
      attachments
    }
  } catch (error) {
    console.error(error);
  }
}  
  if (/https:\/\/www\.instagram\.com\/(p|tv|reel)\/[a-zA-Z0-9]+/.test(link)) {
      const data = await getPost(link, cookie);
      return data;
    } else if (/https:\/\/www\.instagram\.com\/stories\/[\w.]+\/\d+(\?[^\s]*)?/.test(link)) {
      const data = await getStories(link, cookie);
      return data;
    } else {
      const data = await getHighlight(link, cookie);
      return data;
    }
}

async function post(username) {
  const headers = {
    'accept': '*/*',
    'accept-language': 'en-US,en;q=0.9',
    'content-type': 'application/x-www-form-urlencoded',
    'cookie': cookie,
    'origin': 'https://www.instagram.com',
    'referer': `https://www.instagram.com/${username}/`,
    'sec-ch-prefers-color-scheme': 'dark',
    'sec-ch-ua': '"Microsoft Edge";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors', 
    'sec-fetch-site': 'same-origin',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'x-asbd-id': '129477',
    'x-csrftoken': cookie.match(/csrftoken=(.*?);/)[1],
    'x-fb-friendly-name': 'PolarisProfilePostsQuery',
    'x-ig-app-id': '936619743392459',
    'x-fb-lsd': 'aM8wzCKY944etub8JALQaw'
  };

  const variables = {
    data: {
      count: 12,
      include_reel_media_seen_timestamp: true,
      include_relationship_info: true,
      latest_besties_reel_media: true,
      latest_reel_media: true
    },
    username: username,
    __relay_internal__pv__PolarisIsLoggedInrelayprovider: true,
    __relay_internal__pv__PolarisFeedShareMenurelayprovider: true
  };

  const params = {
    av: '17841431197650447',
    __d: 'www',
    __user: '0',
    __a: '1',
    __req: '7',
    doc_id: '8902380376464356',
    variables: JSON.stringify(variables),
    server_timestamps: true
  };

  try {
    const response = await fetch('https://www.instagram.com/graphql/query', {
      method: 'POST',
      headers,
      body: new URLSearchParams(params)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const posts = data.data?.xdt_api__v1__feed__user_timeline_graphql_connection?.edges?.map(edge => {
      const post = edge.node;

      let media;
      if (post.carousel_media) {
        media = post.carousel_media.map(item => ({
          url: item.image_versions2?.candidates[0]?.url,
          type: 'carousel'
        }));
      } else if (post.video_versions) {
        media = [{
          url: post.video_versions[0]?.url,
          type: 'video'
        }];
      } else if (post.image_versions2) {
        media = [{
          url: post.image_versions2.candidates[0]?.url,
          type: 'image'
        }];
      }

      return {
        id: post.pk,
        caption: post.caption?.text,
        media,
        user: {
          username: post.user.username,
          fullName: post.user.full_name,
          profilePic: post.user.profile_pic_url,
          isPrivate: post.user.is_private
        },
        stats: {
          likes: post.like_count,
          comments: post.comment_count
        },
        timestamp: post.caption?.created_at
      };
    }).filter(Boolean);

    return posts;

  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
async function search(query) {
  const headers = {
    'accept': '*/*',
    'accept-language': 'en-US,en;q=0.9',
    'content-type': 'application/x-www-form-urlencoded',
    'cookie': cookie,
    'origin': 'https://www.instagram.com',
    'referer': 'https://www.instagram.com/explore/',
    'x-asbd-id': '129477',
    'x-csrftoken': cookie.match(/csrftoken=(.*?);/)[1],
    'x-fb-friendly-name': 'PolarisSearchBoxRefetchableQuery',
    'x-ig-app-id': '936619743392459'
  };

  const variables = {
    data: {
      context: "blended",
      include_reel: "true",
      query: query,
      rank_token: Date.now() + "|" + Math.random().toString(36).substr(2),
      search_surface: "web_top_search"
    },
    hasQuery: true
  };

  const params = {
    av: '17841431197650447',
    __d: 'www',
    __user: '0',
    __a: '1',
    doc_id: '9153895011291216',
    variables: JSON.stringify(variables),
    server_timestamps: true
  };

  try {
    const response = await fetch('https://www.instagram.com/graphql/query', {
      method: 'POST',
      headers,
      body: new URLSearchParams(params)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data?.xdt_api__v1__fbsearch__topsearch_connection?.users?.map(item => ({
      username: item.user.username,
      fullName: item.user.full_name,
      isVerified: item.user.is_verified,
      profilePic: item.user.profile_pic_url,
      id: item.user.pk
    })) || [];

  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

async function reel() {
  const headers = {
    'accept': '*/*',
    'accept-language': 'en-US,en;q=0.9',
    'content-type': 'application/x-www-form-urlencoded',
    'cookie': cookie,
    'origin': 'https://www.instagram.com',
    'referer': 'https://www.instagram.com/',
    'sec-ch-prefers-color-scheme': 'dark',
    'sec-ch-ua': '"Microsoft Edge";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
    'sec-ch-ua-full-version-list': '"Microsoft Edge";v="131.0.2903.112", "Chromium";v="131.0.6778.205", "Not_A Brand";v="24.0.0.0"',
    'sec-fetch-dest': 'empty',
    'sec-ch-ua-mobile': '?0',
    'sec-fetch-mode': 'cors',
    'sec-ch-ua-platform': '"Windows"',
    'sec-ch-ua-platform-version': '"15.0.0"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-site': 'same-origin',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'x-asbd-id': '129477',
    'x-csrftoken': 'RSQ0yxitYQNDWy6iQghMxVTYEq8PFqct',
    'x-fb-friendly-name': 'PolarisClipsTabDesktopContainerQuery',
    'x-ig-app-id': '936619743392459'
  };

  const params = {
    variables: JSON.stringify({
      data: {
        container_module: "clips_tab_desktop_page"
      },
      first: 2,
      __relay_internal__pv__PolarisReelsShareMenurelayprovider: true
    }),
    doc_id: '9014554128635224'
  };

  try {
    const response = await fetch('https://www.instagram.com/graphql/query', {
      method: 'POST',
      headers: headers,
      body: new URLSearchParams(params)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const clips = data.data?.xdt_api__v1__clips__home__connection_v2?.edges?.map(edge => {
      const media = edge.node?.media;
      if (!media) return null;
      const videoUrl = media.video_versions?.[0]?.url || '';  
      return {
        code: media.code,
        id: media.pk,
        likeCount: media.like_count,
        commentCount: media.comment_count,
        caption: media.caption?.text,
        user: {
          username: media.user?.username,
          profilePic: media.user?.profile_pic_url,
          id: media.user?.pk,
          isVerified: media.user?.is_verified
        },
        video: {
          url: videoUrl,
          height: media.original_height,
          width: media.original_width
        },
        takenAt: media.taken_at,
        hasAudio: media.has_audio
      };
    }).filter(Boolean) || [];

    return {
      clips,
      pageInfo: data.data?.xdt_api__v1__clips__home__connection_v2?.page_info,
      status: data.status
    };

  } catch (error) {
    throw error;
  }
};


module.exports = { igDl, post, 
  search,
  reel 
};
