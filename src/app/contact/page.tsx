'use client';

export default function ContactPage() {
  return (
    <div className='flex min-h-screen flex-col gap-12.5 bg-[#191B24] py-10 max-lg:py-5'>
      <div className='relative mx-auto w-full max-w-200 px-12.5 max-lg:px-5'>
        <div className='relative mb-5 flex min-h-11 items-center justify-center gap-4 max-lg:hidden'>
          <h3 className='m-0 text-[28px] leading-[1.4] font-semibold text-white'>
            Liên hệ
          </h3>
        </div>
        <div>
          <p className='mb-4 text-justify leading-[1.6] text-neutral-400'>
            Chào mừng bạn đến với trang <b>Liên Hệ</b> của MovieHub! Chúng tôi
            luôn sẵn sàng lắng nghe và hỗ trợ bạn để mang lại trải nghiệm tốt
            nhất khi sử dụng dịch vụ. Nếu có bất kỳ câu hỏi, góp ý, hoặc yêu cầu
            hỗ trợ nào, hãy liên hệ với chúng tôi qua các thông tin dưới
            đây.{' '}
          </p>
          <p className='mb-8 max-lg:mb-4'>&nbsp;</p>
          <h3 className='mb-2 text-[20px] leading-normal font-semibold text-white max-lg:text-base'>
            1. Thông Tin Liên Hệ Chính
          </h3>
          <p className='mb-4 text-neutral-400'>
            Email hỗ trợ khách hàng:{' '}
            <a className='text-white' href='mailto:lienhe@moviehub.biz'>
              <b>lienhe@moviehub.biz</b>
            </a>
          </p>
          <ul className='mb-4 list-disc pl-9 text-neutral-400 *:leading-[1.6]'>
            <li>
              <b>Vấn đề tài khoản:</b> Quên mật khẩu, không thể truy cập, và các
              vấn đề liên quan đến tài khoản.
            </li>
            <li>
              <b>Hỗ trợ kỹ thuật:</b> Sự cố khi xem phim, chất lượng video hoặc
              các lỗi khác khi sử dụng trang web.
            </li>
            <li>
              <b>Đóng góp ý kiến:</b> Chúng tôi trân trọng mọi ý kiến đóng góp
              từ bạn để nâng cao chất lượng dịch vụ.
            </li>
          </ul>
          <p className='mb-4 text-neutral-400'>
            Email liên hệ về Chính Sách Riêng Tư:{' '}
            <a href='mailto:lienhe@moviehub.biz'>
              <b className='text-white'>lienhe@moviehub.biz</b>
            </a>
          </p>
          <p className='mb-4 text-neutral-400'>
            Mọi thắc mắc liên quan đến bảo mật thông tin và chính sách riêng tư
            của MovieHub.
          </p>
          <p className='mb-8 max-lg:mb-4'>&nbsp;</p>
          <h3 className='mb-2 text-[20px] leading-normal font-semibold text-white max-lg:text-base'>
            2. Liên Hệ Qua Mạng Xã Hội{' '}
          </h3>
          <p className='mb-4 text-justify leading-[1.6] text-neutral-400'>
            Ngoài email, bạn cũng có thể liên hệ và cập nhật thông tin mới nhất
            từ MovieHub qua các kênh mạng xã hội của chúng tôi:{' '}
          </p>
          <div className='mb-2'>
            <div className='inline-flex min-h-7.5 items-center justify-center gap-2 rounded border border-white bg-white px-3 py-2 text-xs font-medium text-black opacity-100'>
              <div className='h-3 w-3 shrink-0'>
                <img
                  alt='Telegram'
                  src='https://www.rophim.moi/images/social/telegram-icon-black.svg'
                />
              </div>
              <span>Telegram:</span>
              <a
                className='line-clamp-1 block truncate text-left text-[#212529]'
                href='https://t.me/congdongrophim'
                title='Telegram'
                target='_blank'
              >
                https://t.me/congdongmoviehub
              </a>
            </div>
          </div>
          <div className='mb-2'>
            <div className='inline-flex min-h-7.5 items-center justify-center gap-2 rounded border border-white bg-white px-3 py-2 text-xs font-medium text-black opacity-100'>
              <div className='h-3 w-3 shrink-0'>
                <img
                  alt='Discord'
                  src='https://www.rophim.moi/images/social/discord-icon-black.svg'
                />
              </div>
              <span>Discord:</span>
              <a
                className='line-clamp-1 block truncate text-left text-[#212529]'
                href='https://discord.gg/rophim'
                title='Discord'
                target='_blank'
              >
                https://discord.gg/moviehub
              </a>
            </div>
          </div>
          <div className='mb-2'>
            <div className='inline-flex min-h-7.5 items-center justify-center gap-2 rounded border border-white bg-white px-3 py-2 text-xs font-medium text-black opacity-100'>
              <div className='h-3 w-3 shrink-0'>
                <img
                  alt='Facebook'
                  src='https://www.rophim.moi/images/social/facebook-icon-black.svg'
                />
              </div>
              <span>Facebook:</span>
              <a
                className='line-clamp-1 block truncate text-left text-[#212529]'
                href='https://www.facebook.com/rogiaitri'
                title='Facebook'
                target='_blank'
              >
                https://www.facebook.com/moviehub
              </a>
            </div>
          </div>
          <div className='mb-2'>
            <div className='inline-flex min-h-7.5 items-center justify-center gap-2 rounded border border-white bg-white px-3 py-2 text-xs font-medium text-black opacity-100'>
              <div className='h-3 w-3 shrink-0'>
                <img
                  alt='Instagram'
                  src='https://www.rophim.moi/images/social/instagram-icon-black.svg'
                />
              </div>
              <span>Instagram:</span>
              <a
                className='text-dark name-short grow text-start'
                href='https://www.instagram.com/rophimtv'
                title='Instagram'
                target='_blank'
              >
                https://www.instagram.com/moviehub
              </a>
            </div>
          </div>
          <div className='mb-4'>
            <div className='inline-flex min-h-7.5 items-center justify-center gap-2 rounded border border-white bg-white px-3 py-2 text-xs font-medium text-black opacity-100'>
              <div className='h-3 w-3 shrink-0'>
                <img
                  alt='X'
                  src='https://www.rophim.moi/images/social/x-icon-black.svg'
                />
              </div>
              <span>X:</span>
              <a
                className='line-clamp-1 block truncate text-left text-[#212529]'
                href='https://x.com/rophimtv'
                title='X'
                target='_blank'
              >
                https://x.com/moviehub
              </a>
            </div>
          </div>
          <p className='mb-8 max-lg:mb-4'>&nbsp;</p>
          <h3 className='mb-2 text-[20px] leading-normal font-semibold text-white max-lg:text-base'>
            3. Câu Hỏi Thường Gặp (F.A.Q){' '}
          </h3>
          <p className='mb-4 text-justify leading-[1.6] text-neutral-400'>
            Trước khi gửi yêu cầu hỗ trợ, bạn có thể tham khảo trang{' '}
            <a href='/hoi-dap'>
              <b>Câu Hỏi Thường Gặp (F.A.Q)</b>
            </a>{' '}
            để tìm câu trả lời nhanh cho các vấn đề phổ biến nhất tại{' '}
            <b>F.A.Q - MovieHub.</b>
          </p>
          <p className='mb-4 text-justify leading-[1.6] text-neutral-400'>
            Chúng tôi rất vui khi được hỗ trợ bạn và mong muốn mang đến trải
            nghiệm xem phim trực tuyến tốt nhất!{' '}
            <b>
              MovieHub - Cùng bạn khám phá thế giới giải trí đa dạng, an toàn.
            </b>
          </p>
        </div>
      </div>
    </div>
  );
}
