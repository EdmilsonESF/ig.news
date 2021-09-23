import { render, screen } from '@testing-library/react'
import { getSession } from 'next-auth/client'
import { mocked } from 'ts-jest/utils'

import Post, { getServerSideProps } from '../../pages/posts/[slug]'
import { getPrismicClient } from '../../services/prismic'

const post = {
    slug: 'my-post',
    title: 'my-post',
    content: '<p>post excerpt</p>',
    updatedAt: '10 de abril',
  }
  


jest.mock('next-auth/client')
jest.mock('../../services/prismic')

describe('Post page', () => {
  it('render correctly', () => {
    render(
      <Post post={post}/>
    )

    expect(screen.getByText('my-post')).toBeInTheDocument()
    expect(screen.getByText('post excerpt')).toBeInTheDocument()
  })

  it('redirect user if no subscription is found', async () => {
    const getSessionMocked = mocked(getSession)
    
    getSessionMocked.mockResolvedValueOnce({
      activeSubscription: null,
    } as any)

    const response = await getServerSideProps({
      params: { slug: 'my-post' }
    } as any)

    expect(response).toEqual(
      expect.objectContaining({
        redirect: expect.objectContaining({
          destination: `/posts/preview/my-post`,
        })
      })
    )

  })

  it('loads initial data', async () => {
    const getSessionMocked = mocked(getSession)
    const getPrismicClientMocked = mocked(getPrismicClient)

    getPrismicClientMocked.mockReturnValueOnce({
      getByUID: jest.fn().mockResolvedValueOnce({
        data: {
          title: [
            { type: 'heading', text: 'My new post' }
          ],
          content: [
            { type: 'paragraph', text: 'post excerpt' }
          ]
        },
        last_publication_date: '04-01-2021'
      })
    } as any)

    getSessionMocked.mockResolvedValueOnce({
      activeSubscription: 'fake-active',
    } as any)
    


    const response = await getServerSideProps({
      params: { slug: 'my-post' }
    } as any)

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          post: {
            slug: 'my-post',
            title: 'My new post',
            content: '<p>post excerpt</p>',
            updatedAt: '01 de abril de 2021',
          }
          
        }
      })
    )

  })
})