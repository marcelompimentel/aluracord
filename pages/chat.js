import appConfig from '../config.json'
import React from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/router'
import { Box, Text, TextField, Image, Button } from '@skynexui/components'
import { ButtonSendSticker } from '../src/components/ButtonSendSticker'

const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MzMxNjM4NSwiZXhwIjoxOTU4ODkyMzg1fQ.Noxzdp3BA4whYgokVNTl9KKbhqzhb_hSUB9VmFC1zMM'
const SUPABASE_URL = 'https://tewuuufqakmddvgezrzc.supabase.co'
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

function listenerMessagesInRealtime(addMessage) {
	return supabaseClient
		.from('messages')
		.on('INSERT', (response) => {
			addMessage(response.new)
		})
		.subscribe()
}

export default function ChatPage() {
	const router = useRouter()
	const userLogged = router.query.username
	const [message, setMessage] = React.useState('')
	const [messageList, setMessageList] = React.useState([])

	React.useEffect(() => {
		supabaseClient
			.from('messages')
			.select('*')
			.order('id', {ascending:false})
			.then(({ data }) => {
				setMessageList(data)
			})
		
		listenerMessagesInRealtime((newMessage) => {
			// quando o listener é registrado, messageList ainda é vazio
			// o React não 'avisa' o listener de que os estados mudaram
			// para garantir uma messageList atualizada, é necessário passar uma função como parâmetro
			// pois o setMessageList, recebendo uma função, sempre irá retornar o valor atual da messageList
			setMessageList((updatedMessageList) => {
				return [newMessage, ...updatedMessageList]
			})
		})
	}, [])

	function handlerNewMessage(newMessage) {
		const message = {
			author: userLogged,
			text: newMessage
		}

		supabaseClient
			.from('messages')
			.insert([
				message
			])
			.then(({ data }) => {  // é retornado o objeto do registro inserido
				console.log(data)
			})

		setMessage('')
	}

	return (
		<Box
			styleSheet={{
				display: 'flex', alignItems: 'center', justifyContent: 'center',
				backgroundColor: appConfig.theme.colors.primary['500'],
				backgroundImage: 'url(https://virtualbackgrounds.site/wp-content/uploads/2020/08/the-matrix-digital-rain.jpg)',
				backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundBlendMode: 'multiply',
				color: appConfig.theme.colors.neutrals['000'],
			}}
		>
			<Box
				styleSheet={{
					display: 'flex',
					flexDirection: 'column',
					flex: 1,
					boxShadow: '0 2px 10px 0 rgb(0 0 0 / 20%)',
					borderRadius: '5px',
					backgroundColor: appConfig.theme.colors.neutrals['700'],
					height: '100%',
					maxWidth: '95%',
					maxHeight: '95vh',
					padding: '32px'
				}}
			>
				<Header />
				<Box
					styleSheet={{
						position: 'relative',
						display: 'flex',
						flex: 1,
						height: '80%',
						backgroundColor: appConfig.theme.colors.neutrals['600'],
						flexDirection: 'column',
						borderRadius: '5px',
						padding: '16px',
					}}
				>
					<MessageList list={messageList} />

					<Box
						as='form'
						styleSheet={{
							display: 'flex',
							alignItems: 'center',
						}}
					>
						<TextField
							value={message}
							onChange={(event) => {
								setMessage(event.target.value)
							}}
							onKeyPress={(event) => {
								if (event.key === 'Enter') {
									event.preventDefault()
									handlerNewMessage(message)
								}
							}}
							placeholder='Digite sua mensagem aqui...'
							type='textarea'
							styleSheet={{
								width: '100%',
								border: '0',
								resize: 'none',
								borderRadius: '5px',
								padding: '6px 8px',
								backgroundColor: appConfig.theme.colors.neutrals['800'],
								marginRight: '12px',
								color: appConfig.theme.colors.neutrals['200'],
							}}
						/>
						<Button
							onClick={() => {
								handlerNewMessage(message)
							}}
							iconName='chevronRight'
							styleSheet={{
								borderRadius: '50%',
                    			padding: '0 3px 0 0',
                    			minWidth: '50px',
                    			minHeight: '50px',
                    			fontSize: '20px',
                    			marginBottom: '8px',
								marginRight: '8px',
                    			lineHeight: '0',
                    			display: 'flex',
                    			alignItems: 'center',
                    			justifyContent: 'center',
                    			backgroundColor: appConfig.theme.colors.neutrals['800'],
                    			hover: {
                        			filter: 'grayscale(0)',
                    			}
							}}
						/>
						<ButtonSendSticker 
							onStickerClick={(sticker) => {
								handlerNewMessage(`:sticker:${sticker}`)
							}}
						/>
					</Box>
				</Box>
			</Box>
		</Box>
	)
}


function Header() {
	return (
		<>
			<Box
				styleSheet={{ width: '100%', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
			>
				<Text variant='heading5'>
					Chat
				</Text>
				<Button
					variant='tertiary'
					colorVariant='neutral'
					label='Logout'
					href='/'
				/>
			</Box>
		</>
	)
}


function MessageList(props) {
	return (
		<Box
			tag='ul'
			styleSheet={{
				overflow: 'auto',
				display: 'flex',
				flexDirection: 'column-reverse',
				flex: 1,
				color: appConfig.theme.colors.neutrals['000'],
				marginBottom: '16px'
			}}
		>
			{props.list.map((message) => {
				return (
					<Text
						tag='li'
						key={message.id}
						styleSheet={{
							borderRadius: '5px',
							padding: '6px',
							marginBottom: '12px',
							hover: {
								backgroundColor: appConfig.theme.colors.neutrals['700'],
							}
						}}
					>
						<Box styleSheet={{ marginBottom: '8px' }}>
							<Image
								styleSheet={{
									width: '20px',
									height: '20px',
									borderRadius: '50%',
									display: 'inline-block',
									marginRight: '8px',
								}}
								src={`https://github.com/${message.author}.png`}
							/>
							<Text tag='strong'>{message.author}</Text>
							<Text
								styleSheet={{
									fontSize: '10px',
									marginLeft: '8px',
									color: appConfig.theme.colors.neutrals['300'],
								}}
								tag='span'
							>								
								{message.created_at}
							</Text>
						</Box>
						{message.text.startsWith(':sticker:')
							? (
								<Image src={message.text.replace(':sticker:', '')} />
							)
							: (
								message.text
							)
						}
					</Text>
				)
			})}
		</Box>
	)
}